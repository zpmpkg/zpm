import { pathExists } from 'fs-extra'
import {
    concat,
    flatten,
    get,
    has,
    isEmpty,
    keys,
    merge,
    minBy,
    reverse,
    set,
    toPairs,
    uniq,
    unzip,
} from 'lodash'
import * as Logic from 'logic-solver'
import { join, normalize } from 'upath'
import { update } from '~/cli/program'
import { environment } from '~/common/environment'
import { loadJson, writeJson } from '~/common/io'
import { logger } from '~/common/logger'
import { VersionRange } from '~/common/range'
import { isDefined } from '~/common/util'
import { buildSchema, validateSchema } from '~/common/validation'
import { Version } from '~/common/version'
import { Package } from '~/registry/package'
import { Registries } from '~/registry/registries'
import {
    PackageDefinitionSummary,
    PackageDescription,
} from '~/resolver/definition/packageDefinition'
import { SourceVersions } from '~/resolver/source/sourceResolver'
import { lockFileV1 } from '~/schemas/schemas'
import { RegistryPathEntry } from '~/types/definitions.v1'
import { LockfileSchema } from '~/types/lockfile.v1'
import { PackageGitEntry, PackageNamedPathEntry, PackagePathEntry } from '~/types/package.v1'
import { isGitPackageEntry, isNamedPathPackageEntry, isPathPackageEntry } from './package'
import { SATSolution } from './solution'

export interface SATOptions {
    branchHeuristic: boolean
}

export interface SATWeights {
    terms: string[]
    weights: number[]
}

export interface SATRequirements {
    hash?: string
    required?: string[][]
    optional?: string[][]
}

export interface SATGitEntry {
    description: PackageGitEntry
    type: string
}
export interface SATPathEntry {
    description: PackagePathEntry
    type: string
}

export interface SATNamedEntry {
    description: PackageNamedPathEntry
    type: string
}

export class SATSolver {
    public solver = new Logic.Solver()
    public loadedCache: { [k: string]: boolean } = {}
    public versions: { [k: string]: string } = {}
    public termMap: {
        git: {
            [k: string]: {
                package: Package
                version: string
                hash: string
                description: PackageDescription
                settings: { [k: string]: any }
            }
        }
        named: {
            [k: string]: {
                package: Package
                version: string
                path: string
                hash: string
                description: PackageDescription
                settings: { [k: string]: any }
            }
        }
        path: {
            [k: string]: {
                package: Package
                description: PackageDescription
                settings: { [k: string]: any }
            }
        }
    } = {
        git: {},
        path: {},
        named: {},
    }

    public weights: SATWeights = { terms: [], weights: [] }

    public solution: any
    public lockContent: LockfileSchema | undefined

    public registries: Registries
    public assumptions: string[] | undefined
    public minimize: boolean = true
    private lockValidator = buildSchema(lockFileV1)

    constructor(registries: Registries) {
        this.registries = registries
    }

    public async load(): Promise<boolean> {
        this.lockContent = await this.getLockFile()

        if (isDefined(this.lockContent)) {
            const types: string[] = uniq([
                ...keys(get(this.lockContent, 'git')),
                ...keys(get(this.lockContent, 'path')),
                ...keys(get(this.lockContent, 'named')),
            ])
            this.assumptions = []
            for (const type of types) {
                get(this.lockContent.git, type, []).forEach(pkg => {
                    const found: Package = this.registries.searchPackage(type, { name: pkg.name })
                    if (isDefined(found)) {
                        this.assumptions!.push(
                            this.toTerm(found.getHash(), new Version(pkg.version))
                        )
                    } else {
                        // @todo
                    }
                })
                get(this.lockContent.named, type, []).forEach(pkg => {
                    const found: Package = this.registries.searchPackage(type, { name: pkg.name })
                    if (isDefined(found)) {
                        this.assumptions!.push(
                            this.toTerm(found.getHash(), new Version(pkg.version))
                        )
                    } else {
                        // @todo
                    }
                })
            }
        }
        return true
    }

    public async save(): Promise<void> {
        if (isDefined(this.lockContent)) {
            await writeJson(this.getLockFilePath(), this.lockContent)
        }
    }

    public async rollback(): Promise<void> {
        //
    }

    public async addPackage(pkg: Package): Promise<SourceVersions[]> {
        const hash = pkg.getHash()
        if (this.tryInsertPackage(hash)) {
            const versions = await pkg.resolver.getVersions()

            if (versions.length > 0) {
                await this.addPackageVersions(hash, versions, pkg)
                await Promise.all(
                    versions.map(async v => {
                        await this.addDefinition(
                            this.toTerm(hash, v.version),
                            await pkg.resolver.definitionResolver.getPackageDefinition(v.hash)
                        )
                    })
                )
            } else {
                const definition = await pkg.resolver.definitionResolver.getPackageDefinition()
                if (!has(this.termMap.path, hash)) {
                    this.termMap.path[hash] = {
                        package: pkg,
                        description: definition.description,
                        settings: {},
                    }
                }
                await this.addDefinition(hash, definition, { package: pkg, hash })
                this.solver.require(Logic.exactlyOne(hash))
            }
            // await this.addDefinition(hash, pkg.resolver.definitionResolver.getPackageDefinition())
            return versions
        }
        return pkg.resolver.getVersions()
    }

    public async addDefinition(
        hash: string,
        definition: PackageDefinitionSummary,
        parent?: { package: Package; hash: string }
    ) {
        await Promise.all([
            ...flatten(
                toPairs(definition.packages.git).map(p =>
                    p[1]
                        .filter(x => isGitPackageEntry(x))
                        .map((e): SATGitEntry => ({ description: e, type: p[0] }))
                )
            ).map(async pkg => {
                await this.addGitEntry(pkg, hash, parent)
            }),
            ...flatten(
                toPairs(definition.packages.path).map(p =>
                    p[1]
                        .filter(x => isPathPackageEntry(x))
                        .map((e): SATPathEntry => ({ description: e, type: p[0] }))
                )
            ).map(async pkg => {
                await this.addPathEntry(pkg, hash, parent!)
            }),
            ...flatten(
                toPairs(definition.packages.named).map(p =>
                    p[1]
                        .filter(x => isNamedPathPackageEntry(x))
                        .map((e): SATNamedEntry => ({ description: e, type: p[0] }))
                )
            ).map(async pkg => {
                await this.addNamedEntry(pkg, hash, parent!)
            }),
        ])
    }

    public async optimize(): Promise<SATSolution> {
        if (isDefined(this.assumptions)) {
            this.solution = this.solver.solveAssuming(Logic.and(...this.assumptions))
            this.minimize = this.solution || update()
        }

        if (!isDefined(this.solution)) {
            this.solution = this.solver.solve()
        }

        this.solution.ignoreUnknownVariables()
        const minimum: string[] | undefined = this.minimize
            ? this.solver
                  .minimizeWeightedSum(this.solution, this.weights.terms, this.weights.weights)
                  .getTrueVars()
            : this.solution.getTrueVars()

        const solution: SATSolution = {
            git: {},
            path: {},
            named: {},
        }
        if (minimum) {
            // make settings stable
            minimum.sort()
            await Promise.all(
                minimum.map(async (term: string) => {
                    if (has(this.termMap.git, term)) {
                        const pkg = this.termMap.git[term]
                        if (!get(solution.git, pkg.package.manifest.type)) {
                            set(solution.git, pkg.package.manifest.type, [])
                        }

                        solution.git[pkg.package.manifest.type].push({
                            name: pkg.package.fullName,
                            version: pkg.version,
                            hash: pkg.hash,
                            settings: this.buildBranch(minimum!, term),
                        })
                    } else if (has(this.termMap.path, term)) {
                        const pkg = this.termMap.path[term]
                        if (!get(solution.path, pkg.package.manifest.type)) {
                            set(solution.path, pkg.package.manifest.type, [])
                        }

                        solution.path[pkg.package.manifest.type].push({
                            root: pkg.package.getRootName(),
                            path: pkg.package.resolver.getPath(),
                            name: pkg.package.getHash(),
                            settings: this.buildBranch(minimum!, term),
                        })
                    } else if (has(this.termMap.named, term)) {
                        const pkg = this.termMap.named[term]
                        if (!get(solution.named, pkg.package.manifest.type)) {
                            set(solution.named, pkg.package.manifest.type, [])
                        }

                        solution.named[pkg.package.manifest.type].push({
                            name: pkg.package.fullName,
                            path: pkg.package.resolver.getPath(),
                            version: pkg.version,
                            hash: pkg.hash,
                            settings: this.buildBranch(minimum!, term),
                        })
                    }
                })
            )
        }

        this.lockContent = validateSchema(solution, undefined, {
            throw: true,
            validator: this.lockValidator,
        })

        return solution
    }

    public buildBranch(minimum: string[], term: string) {
        const levels: Array<{ settings: any; depth: number }> = []
        minimum.map(m => {
            let settings: any
            if (has(this.termMap.git, [term, 'settings', m])) {
                settings = get(this.termMap.git, [term, 'settings', m])
            } else if (has(this.termMap.path, [term, 'settings', m])) {
                settings = get(this.termMap.path, [term, 'settings', m])
            }
            if (isDefined(settings)) {
                levels.push({ settings, depth: this.countParents(minimum, m) })
            }
        })
        // @todo: allow merge strategies https://www.npmjs.com/package/deeply#default-behavior
        return merge({}, ...levels.sort((a, b) => a.depth - b.depth).map(l => l.settings))
    }

    public countParents(minimum: string[], parent: string, depth: number = 0) {
        const parents: Array<{ parent: string; depth: number }> = []
        minimum.map(m => {
            let settings: any | undefined
            if (has(this.termMap.git, [parent, 'settings', m])) {
                settings = get(this.termMap.git, [parent, 'settings', m])
            } else if (has(this.termMap.path, [parent, 'settings', m])) {
                settings = get(this.termMap.path, [parent, 'settings', m])
            }
            if (isDefined(settings)) {
                parents.push({ parent: m, depth: this.countParents(minimum, m, depth + 1) })
            }
        })
        if (isEmpty(parents)) {
            return depth
        } else {
            return minBy(parents, p => p.depth)!.depth
        }
    }

    public addPackageRequirements(value: SATRequirements) {
        if (value.hash) {
            if (isDefined(value.required)) {
                value.required.forEach(r => {
                    this.solver.require(Logic.implies(value.hash, Logic.exactlyOne(...r)))
                })
            }
            if (isDefined(value.optional)) {
                value.optional.forEach(r => {
                    this.solver.require(Logic.implies(value.hash, Logic.atMostOne(...r)))
                })
            }
        } else {
            if (isDefined(value.required)) {
                value.required.forEach(r => {
                    this.solver.require(Logic.exactlyOne(...r))
                })
            }
            if (isDefined(value.optional)) {
                value.optional.forEach(r => {
                    this.solver.require(Logic.atMostOne(...r))
                })
            }
        }

        // onsole.log(this.solver.solve().getMap())
    }

    public async addPackageVersions(
        hash: string,
        versions: SourceVersions[],
        pkg: Package
    ): Promise<void> {
        const newTerms = unzip(
            reverse(
                await Promise.all(
                    versions.map(async v => {
                        const definition = await pkg.resolver.definitionResolver.getPackageDefinition(
                            v.hash
                        )
                        const term = this.toTerm(hash, v.version)
                        if (!has(this.termMap.git, hash)) {
                            this.termMap.git[term] = {
                                package: pkg,
                                version: v.version.toString(),
                                hash: v.hash,
                                description: definition.description,
                                settings: {},
                            }
                        }
                        return [term, v.version.cost]
                    })
                )
            )
        )
        if (!isEmpty(newTerms[0]) && !isEmpty(newTerms[1])) {
            this.weights.terms = concat(this.weights.terms || [], newTerms[0] as string[])
            this.weights.weights = concat(this.weights.weights || [], newTerms[1] as number[])
            // this.solver.require(Logic.atMostOne(...newTerms[0]))
        }
    }

    public async getLockFile(): Promise<LockfileSchema | undefined> {
        const file = this.getLockFilePath()
        let content
        if (await pathExists(file)) {
            try {
                content = await loadJson(file)
                content = validateSchema(content, undefined, {
                    throw: true,
                    validator: this.lockValidator,
                })
            } catch (e) {
                logger.warn('Lock file format is invalid, generating a new one...')
                content = undefined
            }
        }
        return content
    }

    private getLockFilePath() {
        return join(environment.directory.workingdir, '.package.lock')
    }

    private async addPathEntry(
        pkg: SATPathEntry,
        hash: string,
        parent: { package: Package; hash: string }
    ): Promise<void> {
        const absolutePath = normalize(
            join(
                ...[
                    ...(parent.package.options.root
                        ? [(parent.package.entry as RegistryPathEntry).path]
                        : []),
                    pkg.description.path,
                ]
            )
        )
        const rootHash = parent.package.options.rootHash || parent.hash
        const name = `${rootHash}:${absolutePath}`
        const added = this.registries.addPackage(
            pkg.type,
            {
                path: absolutePath,
                name,
            },
            {
                rootHash,
                root: parent.package.options.root || parent.package,
                isRoot: false,
                parent: parent.package,
            }
        )
        try {
            await added.load()
        } catch (error) {
            logger.error(
                `Failed to load the definition of the root package:\n\n${error.message}\n${
                    error.stack
                }`
            )
        }
        // console.log(added)
        await this.addPackage(added)

        if (!has(this.termMap.path, [name, 'settings', hash])) {
            set(this.termMap.path, [name, 'settings', hash], pkg.description.settings)
        }
    }

    private async addGitEntry(
        pkg: SATGitEntry,
        hash: string,
        parent?: { package: Package; hash: string }
    ): Promise<void> {
        const found = this.registries.searchPackage(pkg.type, { name: pkg.description.name })
        if (found) {
            const versions = await this.addPackage(found)
            const fhash = found.getHash()
            const range = new VersionRange(pkg.description.version)
            versions.filter(v => range.satisfies(v.version))
            this.addPackageRequirements({
                hash,
                required: [
                    versions
                        .filter(v => range.satisfies(v.version))
                        .map(x => this.toTerm(fhash, x.version)),
                ],
            })

            if (isDefined(parent)) {
                versions.forEach(x => {
                    if (!has(this.termMap.git, [this.toTerm(fhash, x.version), 'settings', hash])) {
                        set(
                            this.termMap.git,
                            [this.toTerm(fhash, x.version), 'settings', hash],
                            pkg.description.settings
                        )
                    }
                })
            }
        } else {
            throw new Error('not implemented')
        }
    }

    private async addNamedEntry(
        pkg: SATNamedEntry,
        hash: string,
        parent?: { package: Package; hash: string }
    ): Promise<void> {
        const found = this.registries.searchPackage(pkg.type, { name: pkg.description.name })
        console.log(pkg, found, '@@@@@@@@@@@@@@@@@@@@@@@@@@@@')
        if (found) {
            const versions = await this.addPackage(found)
            const fhash = found.getHash()
            const range = new VersionRange(pkg.description.version)
            versions.filter(v => range.satisfies(v.version))
            this.addPackageRequirements({
                hash,
                required: [
                    versions
                        .filter(v => range.satisfies(v.version))
                        .map(x => this.toTerm(fhash, x.version)),
                ],
            })

            if (isDefined(parent)) {
                versions.forEach(x => {
                    if (
                        !has(this.termMap.named, [this.toTerm(fhash, x.version), 'settings', hash])
                    ) {
                        set(
                            this.termMap.named,
                            [this.toTerm(fhash, x.version), 'settings', hash],
                            pkg.description.settings
                        )
                    }
                })
            }
        } else {
            throw new Error('not implemented')
        }
    }

    private tryInsertPackage(hash: string): boolean {
        if (!get(this.loadedCache, hash)) {
            set(this.loadedCache, hash, true)
            return true
        }
        return false
    }

    private toTerm(hash: string, version: Version) {
        return `${hash}@${version.toString()}`
    }
}
