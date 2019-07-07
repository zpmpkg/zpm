import { get } from '@zefiros/axioms'
import { pathExists } from 'fs-extra'
import {
    concat,
    first,
    flatten,
    has,
    intersection,
    isEmpty,
    map,
    merge,
    minBy,
    omit,
    reverse,
    set,
    toPairs,
    unzip,
} from 'lodash'
import * as Logic from 'logic-solver'
import { dirname, join, normalize } from 'upath'
import { update } from '~/cli/program'
import { settledPromiseAll } from '~/common/async'
import { environment } from '~/common/environment'
import { loadJson, writeJson } from '~/common/io'
import { logger } from '~/common/logger'
import { VersionRange } from '~/common/range'
import { isDefined } from '~/common/util'
import { buildSchema, validateSchema } from '~/common/validation'
import { Version } from '~/common/version'
import { Package, PackageType } from '~/registry/package'
import { Registries } from '~/registry/registries'
import {
    PackageDefinitionSummary,
    PackageDescription,
} from '~/resolver/definition/packageDefinition'
import { SourceVersions } from '~/resolver/source/sourceResolver'
import { lockFileV1 } from '~/schemas/schemas'
import { RegistryNamedEntry, RegistryPathEntry } from '~/types/definitions.v1'
import { LockfileSchema, UsageLock } from '~/types/lockfile.v1'
import { PackageGitEntry, PackagePathEntry } from '~/types/package.v1'
import { isGitPackageEntry, isPathPackageEntry } from './package'
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
    definitionPath: string
    type: string
    optional: boolean
}
export interface SATPathEntry {
    description: PackagePathEntry
    definitionPath: string
    type: string
    optional: boolean
}

export interface SATUsage {
    required: { [k: string]: string[][] }
    optional: { [k: string]: string[][] }
}

export class SATSolver {
    public solver = new Logic.Solver()
    public loadedCache: { [k: string]: boolean } = {}
    public versions: { [k: string]: string } = {}
    public termMap: {
        named: {
            [k: string]: {
                package: Package
                version: string
                hash: string
                description: PackageDescription
                usage: SATUsage
                settings: {
                    [k: string]: any
                }
            }
        }
        path: {
            [k: string]: {
                package: Package
                description: PackageDescription
                usage: SATUsage
                root?: string
                settings: {
                    [k: string]: any
                }
            }
        }
    } = {
        named: {},
        path: {},
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
            // const types: string[] = this.registries.getTypes()
            // this.assumptions = []
            // for (const type of types) {
            //     for await (const pkg of get(this.lockContent.named, [type], [])) {
            //         const found = await this.registries.searchPackage(type, { name: pkg.name })
            //         if (isDefined(found)) {
            //             this.assumptions!.push(
            //                 this.toTerm(found.getHash(), new Version(pkg.version))
            //             )
            //         } else {
            //             // @todo
            //         }
            //     }
            // }
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

    public async addPackage(pkg: Package, extra: any = {}): Promise<SourceVersions[]> {
        const hash = pkg.getId()
        const versions = await pkg.source.getVersions()
        if (await this.tryInsertPackage(hash)) {
            if (versions.length > 0) {
                await this.addPackageVersions(hash, versions, pkg)
            } else {
                const definition = await pkg.source.definitionResolver.getPackageDefinition()

                let hasLock = false
                if (!has(this.termMap.path, [hash, 'package'])) {
                    this.termMap.path[hash] = {
                        package: pkg,
                        description: definition.description,
                        usage: {
                            required: {},
                            optional: {},
                        },
                        settings: {},
                        ...extra,
                    }
                    hasLock = true
                }
                const usage = await this.addDefinition(hash, definition, { package: pkg, hash })

                if (hasLock) {
                    this.termMap.path[hash].usage = usage
                }
                // console.log(hash, '@')
                this.solver.require(Logic.exactlyOne(hash))
            }
            // await this.addDefinition(hash, pkg.resolver.definitionResolver.getPackageDefinition())
            this.unlockPackage(hash)
        }
        return versions
    }

    public async addDefinition(
        hash: string,
        definition: PackageDefinitionSummary,
        parent?: { package: Package; hash: string }
    ): Promise<SATUsage> {
        const usage: SATUsage = { required: {}, optional: {} }
        await settledPromiseAll([
            ...flatten(
                toPairs(definition.packages.named).map(p =>
                    p[1]
                        .filter(x => isGitPackageEntry(x))
                        .map(
                            (e): SATGitEntry => ({
                                description: e,
                                definitionPath: definition.definitionPath,
                                type: p[0],
                                optional: e.optional === true,
                            })
                        )
                )
            ).map(async pkg => {
                const found = await this.addNamedEntry(pkg, hash, parent)
                const key = pkg.optional ? 'optional' : 'required'
                if (!isDefined(usage[key][pkg.type])) {
                    usage[key][pkg.type] = []
                }
                usage[key][pkg.type].push(found.terms)
            }),
            ...flatten(
                toPairs(definition.packages.path).map(p =>
                    p[1]
                        .filter(x => isPathPackageEntry(x))
                        .map(
                            (e): SATPathEntry => ({
                                description: {
                                    name: e.name || '$ROOT',
                                    version: e.version,
                                    path: e.path,
                                    settings: e.settings,
                                },
                                definitionPath: definition.definitionPath,
                                type: p[0],
                                optional: e.optional === true,
                            })
                        )
                )
            ).map(async pkg => {
                const term = await this.addPathEntry(pkg, hash, parent!)
                const key = pkg.optional ? 'optional' : 'required'
                if (!isDefined(usage[key][pkg.type])) {
                    usage[key][pkg.type] = []
                }
                usage[key][pkg.type].push([term])
            }),
        ])
        return usage
    }

    public async optimize(): Promise<SATSolution> {
        if (isDefined(this.assumptions)) {
            this.solution = this.solver.solveAssuming(Logic.and(...this.assumptions))
            this.minimize = this.solution || update()
        }

        if (!isDefined(this.solution)) {
            this.solution = this.solver.solve()
        }

        if (!isDefined(this.solution)) {
            throw new Error('NO solution was found')
        }

        this.solution.ignoreUnknownVariables()
        const minimum: string[] | undefined = this.minimize
            ? this.solver
                  .minimizeWeightedSum(this.solution, this.weights.terms, this.weights.weights)
                  .getTrueVars()
            : this.solution.getTrueVars()

        const solution: SATSolution = {
            named: {},
            path: {},
        }
        if (minimum) {
            // make settings stable
            minimum.sort()
            await settledPromiseAll(
                minimum.map(async (term: string) => {
                    if (has(this.termMap.named, term)) {
                        const pkg = this.termMap.named[term]
                        if (!get(solution.named, [pkg.package.manifest.type])) {
                            set(solution.named, pkg.package.manifest.type, [])
                        }

                        solution.named[pkg.package.manifest.type].push({
                            id: term,
                            name: pkg.package.fullName,
                            version: pkg.version,
                            hash: pkg.hash,
                            description: pkg.description,
                            settings: this.buildBranch(minimum!, term, pkg.package.manifest.type),
                            usage: this.filterUsage(pkg.usage, minimum, 'named', term),
                        })
                    } else if (has(this.termMap.path, term)) {
                        const pkg = this.termMap.path[term]
                        if (!get(solution.path, [pkg.package.manifest.type])) {
                            set(solution.path, pkg.package.manifest.type, [])
                        }
                        solution.path[pkg.package.manifest.type].push({
                            id: term,
                            name: pkg.package.name,
                            path: pkg.package.source.getPath(),
                            description: pkg.description,
                            root: pkg.root,
                            settings: this.buildBranch(minimum!, term, pkg.package.manifest.type),
                            usage: this.filterUsage(pkg.usage, minimum, 'path', term),
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

    public filterUsage(
        usage: SATUsage,
        minimum: string[],
        pathOrNamed: 'named' | 'path',
        id: string
    ): UsageLock | undefined {
        const fUsage: UsageLock = { settings: {} }
        map(omit(usage, 'settings'), (o, type) => {
            map(o, (usagesList, packageType) => {
                const isBuildDefinition =
                    this.registries.getManifest(packageType).options.isBuildDefinition === true
                usagesList.forEach(usages => {
                    let filteredUsages: string[] | string | undefined = intersection(
                        usages,
                        minimum
                    )

                    if (isBuildDefinition) {
                        if (filteredUsages.length > 1) {
                            throw new Error(
                                `Singular package type ${packageType} has multiple values`
                            )
                        }
                        filteredUsages = first(filteredUsages)
                    }

                    if (filteredUsages) {
                        if (!has(fUsage, [type, packageType])) {
                            set(fUsage, [type, packageType], filteredUsages)
                        }
                    }
                })
            })
        })
        map(this.termMap[pathOrNamed][id].settings, (value, user) => {
            if (!isEmpty(value) && minimum.includes(user)) {
                fUsage.settings![user] = value
            }
        })
        if (isEmpty(fUsage.settings)) {
            fUsage.settings = undefined
        }
        return isEmpty(fUsage) ? undefined : fUsage
    }

    public buildBranch(minimum: string[], term: string, type: string) {
        // do not merge settings for build definition packages
        if (
            this.registries
                .getRegistries()
                .filter(x => get(x.options, ['isBuildDefinition']))
                .map(x => x.name)
                .includes(type)
        ) {
            return {}
        }

        const levels: Array<{ settings: any; depth: number }> = []
        minimum.map(m => {
            let settings: any
            if (has(this.termMap.named, [term, 'settings', m])) {
                settings = get(this.termMap.named, [term, 'settings', m])
            } else if (has(this.termMap.path, [term, 'settings', m])) {
                settings = get(this.termMap.path, [term, 'settings', m])
            }
            if (!isEmpty(settings)) {
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
            if (has(this.termMap.named, [parent, 'settings', m])) {
                settings = get(this.termMap.named, [parent, 'settings', m])
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
    }

    public async addPackageVersions(
        hash: string,
        versions: SourceVersions[],
        pkg: Package
    ): Promise<{ versions: Array<{ version: SourceVersions; term: string; added: boolean }> }> {
        const newVersions = versions.map(v => ({
            version: v,
            term: this.toTerm(hash, v.version),
            added: false,
        }))
        const newTerms = unzip(
            reverse(
                await settledPromiseAll(
                    newVersions.map(async v => {
                        const definition = await pkg.source.definitionResolver.getPackageDefinition(
                            v.version.hash
                        )
                        if (!has(this.termMap.named, [v.term, 'package'])) {
                            this.termMap.named[v.term] = {
                                package: pkg,
                                version: v.version.version.toString(),
                                hash: v.version.hash,
                                description: definition.description,
                                usage: {
                                    optional: {},
                                    required: {},
                                },
                                settings: {},
                            }
                            v.added = true
                        }
                        return [v.term, v.version.version.cost]
                    })
                )
            )
        )

        await settledPromiseAll(
            newVersions.map(async v => {
                if (v.added) {
                    const usage = await this.addDefinition(
                        v.term,
                        await pkg.source.definitionResolver.getPackageDefinition(v.version.hash),
                        { package: pkg, hash }
                    )
                    this.termMap.named[v.term].usage = usage
                }
            })
        )
        if (!isEmpty(newTerms[0]) && !isEmpty(newTerms[1])) {
            this.weights.terms = concat(this.weights.terms || [], newTerms[0] as string[])
            this.weights.weights = concat(this.weights.weights || [], newTerms[1] as number[])
            // this.solver.require(Logic.atMostOne(...newTerms[0]))
        }
        return { versions: newVersions }
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
        return join(environment.directory.workingdir, '.zpm.lock')
    }

    private async addPathEntry(
        pkg: SATPathEntry,
        hash: string,
        parent: { package: Package; hash: string }
    ): Promise<string> {
        const name = pkg.description.name
        if (isDefined(name) && name !== '$ROOT') {
            return this.addNamedPathEntry(pkg, hash)
        }

        const absolutePath = normalize(
            join(
                ...(parent.package.options.root
                    ? [(parent.package.entry as RegistryPathEntry).path]
                    : []),
                pkg.description.path
            )
        )
        const rootHash = parent.package.options.rootHash || parent.hash
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
                type: PackageType.Path,
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

        await this.addPackage(added, { root: rootHash })
        const fname = added.getHash()

        if (!has(this.termMap.path, [fname, 'settings', hash])) {
            set(this.termMap.path, [fname, 'settings', hash], pkg.description.settings)
        }

        return fname
    }

    private async addNamedPathEntry(pkg: SATPathEntry, hash: string): Promise<string> {
        const absolutePath = pkg.description.path
        const name = pkg.description.name!
        const { found: root } = await this.addNamedEntry(
            {
                type: pkg.type,
                description: {
                    name,
                    version: pkg.description.version || '*',
                },
                definitionPath: pkg.definitionPath,
                optional: false,
            },
            hash
        )
        const options = {
            root,
            parent: root,
            type: PackageType.Named,
        }
        const added = this.registries.addPackage(
            pkg.type,
            {
                path: absolutePath,
                name,
            },
            options
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
        await this.addPackage(added)
        const fname = added.getHash()

        if (!has(this.termMap.path, [fname, 'settings', hash])) {
            set(this.termMap.path, [fname, 'settings', hash], pkg.description.settings)
        }

        return fname
    }

    private async addNamedEntry(
        pkg: SATGitEntry,
        hash: string,
        parent?: { package: Package; hash: string }
    ): Promise<{ found: Package; terms: string[] }> {
        const found = await this.registries.search(pkg.type, {
            name: pkg.description.name,
            definition: pkg.description.definition,
            repository: pkg.description.repository,
        })
        if (found) {
            if (
                parent &&
                ((parent.package.options.root && parent.package.options.root.options.isRoot) ||
                    parent.package.options.isRoot)
            ) {
                // make sure root packages use the right directory
                found.options.absolutePath = dirname(pkg.definitionPath)
                const entry: RegistryNamedEntry = {
                    name: pkg.description.name,
                    repository: found.source.repository,
                    definition: pkg.description.definition || found.source.definition,
                }
                await found.overrideEntry(entry)
            }

            const fhash = found.getHash()
            const versions = await this.addPackage(found)
            const range = new VersionRange(pkg.description.version)
            const fversions = versions.filter(v => range.satisfies(v.version))
            // use the allowed or otherwise expose errors
            const terms = fversions.map(x => this.toTerm(fhash, x.version))

            if (!isEmpty(terms)) {
                this.addPackageRequirements({
                    hash,
                    required: [terms],
                })
            } else if (!isEmpty(versions)) {
                throw new Error(
                    `Required version range '${
                        pkg.description.version
                    }' did not match any version for '${pkg.description.name}'`
                )
            }

            if (isDefined(parent)) {
                fversions.forEach(x => {
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
            return { found, terms }
        } else {
            throw new Error(`not implemented ${JSON.stringify(pkg)}`)
        }
    }

    private async tryInsertPackage(hash: string): Promise<boolean> {
        if (!this.loadedCache[hash]) {
            this.loadedCache[hash] = false
            return true
        }
        // else {
        //     while (!this.loadedCache[hash]) {
        //         // wait until this path has been resolved
        //         await sleep(1)
        //     }
        // }
        return false
    }

    private unlockPackage(hash: string) {
        this.loadedCache[hash] = true
    }

    private toTerm(hash: string, version: Version) {
        return `${hash}@${version.toString()}`
    }
}
