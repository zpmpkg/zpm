import { pathExists } from 'fs-extra'
import {
    concat,
    flatten,
    get,
    has,
    isEmpty,
    keys,
    reverse,
    set,
    toPairs,
    uniq,
    unzip,
} from 'lodash'
import * as Logic from 'logic-solver'
import { join } from 'upath'
import { update } from '~/cli/program'
import { loadJson, writeJson } from '~/common/io'
import { logger } from '~/common/logger'
import { VersionRange } from '~/common/range'
import { isDefined } from '~/common/util'
import { Version } from '~/common/version'
import { Package } from '~/registry/package'
import { Registries } from '~/registry/registries'
import {
    PackageDefinitionSummary,
    PackageGitSummary,
    PackagePathSummary,
} from '~/resolver/definition/packageDefinition'
import { SourceVersions } from '~/resolver/source/sourceResolver'
import { LockfileSchema } from '~/types/lockfile.v1'
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
    description: PackageGitSummary
    type: string
}
export interface SATPathEntry {
    description: PackagePathSummary
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
            }
        }
        path: {
            [k: string]: {
                package: Package
            }
        }
    } = {
        git: {},
        path: {},
    }

    public weights: SATWeights = { terms: [], weights: [] }

    public solution: any
    public lockContent: LockfileSchema | undefined

    public registries: Registries
    public assumptions: string[] | undefined
    public minimize: boolean = true

    constructor(registries: Registries) {
        this.registries = registries
    }

    public async load(): Promise<boolean> {
        this.lockContent = await this.getLockFile()

        if (isDefined(this.lockContent)) {
            const types: string[] = uniq([
                ...keys(get(this.lockContent, 'git')),
                ...keys(get(this.lockContent, 'path')),
            ])
            this.assumptions = []
            for (const type of types) {
                this.lockContent.git[type].forEach(pkg => {
                    const found: Package = get(this.registries.manifests, [
                        type,
                        'entries',
                        pkg.name,
                    ])
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

    public async save() {
        if (isDefined(this.lockContent)) {
            await writeJson(this.getLockFilePath(), this.lockContent)
        }
    }

    public async rollback() {
        //
    }

    public async addPackage(pkg: Package): Promise<SourceVersions[]> {
        const hash = pkg.getHash()
        // console.log('%%%%%%%%%%%%%%', hash)
        if (this.tryInsertPackage(hash)) {
            const versions = await pkg.resolver.getVersions()
            // console.log(versions)

            if (versions.length > 0) {
                this.addPackageVersions(hash, versions, pkg)
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
                this.termMap.path[hash] = {
                    package: pkg,
                }
                await this.addDefinition(hash, definition, pkg)
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
        parent?: Package
    ) {
        // this.solver.require(Logic.implies(hash))
        // logger.info(hash, definition, '@@@')

        await Promise.all([
            ...flatten(
                toPairs(definition.packages.git).map(p =>
                    p[1]
                        .filter(x => isGitPackageEntry(x))
                        .map((e): SATGitEntry => ({ description: e, type: p[0] }))
                )
            ).map(async pkg => {
                await this.addGitEntry(pkg, hash)
            }),
            ...flatten(
                toPairs(definition.packages.path).map(p =>
                    p[1]
                        .filter(x => isPathPackageEntry(x))
                        .map((e): SATPathEntry => ({ description: e, type: p[0] }))
                )
            ).map(async pkg => {
                await this.addPathEntry(pkg, parent!)
            }),
        ])
    }

    public async optimize(): Promise<SATSolution> {
        if (isDefined(this.assumptions)) {
            this.solution = this.solver.solveAssuming(Logic.and(...this.assumptions))
            this.minimize = update()
        }

        if (!isDefined(this.solution)) {
            this.solution = this.solver.solve()
        }

        this.solution.ignoreUnknownVariables()
        const minimum = this.minimize
            ? this.solver
                  .minimizeWeightedSum(this.solution, this.weights.terms, this.weights.weights)
                  .getTrueVars()
            : this.solution.getTrueVars()

        console.log(minimum)

        const solution: SATSolution = {
            git: {},
            path: {},
        }
        if (minimum) {
            await Promise.all(
                minimum.map(async (term: string) => {
                    if (has(this.termMap.git, term)) {
                        const pkg = this.termMap.git[term]
                        //const description = await pkg.description()
                        if (!get(solution.git, pkg.package.manifest.type)) {
                            set(solution.git, pkg.package.manifest.type, [])
                        }
                        solution.git[pkg.package.manifest.type].push({
                            name: pkg.package.fullName,
                            version: pkg.version,
                            hash: pkg.hash,
                            // meta: {
                            //     settingList: [],
                            //     settings: {},
                            //     //description,
                            // },
                        })
                    } else if (has(this.termMap.path, term)) {
                        const pkg = this.termMap.path[term]
                        //const description = await pkg.description()
                        if (!get(solution.path, pkg.package.manifest.type)) {
                            set(solution.path, pkg.package.manifest.type, [])
                        }

                        solution.path[pkg.package.manifest.type].push({
                            root: pkg.package.getRootName(),
                            path: pkg.package.resolver.getPath(),
                            name: pkg.package.getHash(),
                            // meta: {
                            //     settingList: [],
                            //     settings: {},
                            //     //description,
                            // },
                        })
                    }
                })
            )
        }
        // logger.log(solution)
        this.lockContent = solution
        return solution
    }

    public addPackageRequirements(value: SATRequirements) {
        // console.log(value)
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

    public addPackageVersions(hash: string, versions: SourceVersions[], pkg: Package) {
        const newTerms = unzip(
            reverse(
                versions.map(v => {
                    const term = this.toTerm(hash, v.version)
                    this.termMap.git[term] = {
                        package: pkg,
                        version: v.version.toString(),
                        hash: v.hash,
                        // description: async () => {
                        //     return (await pkg.resolver.definitionResolver.getPackageDefinition(
                        //         v.hash
                        //     )).description
                        // },
                    }
                    return [term, v.version.cost]
                })
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
            content = await loadJson(file)
        }
        return content
    }

    private getLockFilePath() {
        return join(process.cwd(), '.package.lock')
    }

    private async addPathEntry(pkg: SATPathEntry, parent: Package) {
        const added = this.registries.addPackage(
            pkg.type,
            {
                path: pkg.description.path,
            },
            {
                root: parent.options.root || parent,
                isRoot: false,
                parent,
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
    }

    private async addGitEntry(pkg: SATGitEntry, hash: string) {
        const found = get(this.registries.manifests, [pkg.type, 'entries', pkg.description.name])
        if (found) {
            const versions = await this.addPackage(found)
            const range = new VersionRange(pkg.description.version)
            versions.filter(v => range.satisfies(v.version))
            this.addPackageRequirements({
                hash,
                required: [
                    versions
                        .filter(v => range.satisfies(v.version))
                        .map(x => this.toTerm(found.getHash(), x.version)),
                ],
            })
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
