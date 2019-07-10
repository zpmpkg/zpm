import { pathExists } from 'fs-extra'
import * as Logic from 'logic-solver'
import { join } from 'upath'
import { update } from '~/cli/program'
import { environment } from '~/common/environment'
import { loadJson } from '~/common/io'
import { logger } from '~/common/logger'
import { isDefined } from '~/common/util'
import { buildSchema, validateSchema } from '~/common/validation'
import { InternalDefinitionEntry } from '~/package/entry'
import { Package, PackageVersion, ParentUsage } from '~/package/package'
import { Registries } from '~/registry/registries'
import { lockFileV1 } from '~/schemas/schemas'
import { LockfileSchema } from '~/types/lockfile.v1'

export interface SATWeights {
    terms: string[]
    weights: number[]
}

export interface SATRequirements {
    term?: string
    required?: string[][]
    optional?: string[][]
}

export class SATSolver {
    public solver = new Logic.Solver()

    public weights: SATWeights = { terms: [], weights: [] }
    public loadedCache: { [k: string]: boolean | undefined } = {}
    public versionMap: Map<string, PackageVersion> = new Map()

    public solution: any

    public registries: Registries
    public assumptions: string[] | undefined
    public minimize: boolean = true
    private lockValidator = buildSchema(lockFileV1)

    constructor(registries: Registries) {
        this.registries = registries
    }

    public async load(): Promise<boolean> {
        return true
    }

    public async save(): Promise<void> {}

    public async rollback(): Promise<void> {
        //
    }

    public async addPackage(pkg: Package, parent?: ParentUsage) {
        const versions = await pkg.getVersions()
        const allowedVersions: PackageVersion[] = []

        this.addNewPackage(pkg, versions, parent, allowedVersions)
        this.addVersionConstraints(parent, allowedVersions)
    }

    public addVersionConstraints(
        parent: ParentUsage | undefined,
        allowedVersions: PackageVersion[]
    ) {
        if (parent && !parent.entry.usage.optional) {
            const allowedTerms = allowedVersions.map(v => v.id)
            this.solver.require(Logic.implies(parent.addedBy.id, Logic.exactlyOne(...allowedTerms)))
        }
    }

    public addNewPackage(
        pkg: Package,
        versions: PackageVersion[],
        parent: ParentUsage | undefined,
        allowedVersions: PackageVersion[]
    ) {
        if (!this.loadedCache[pkg.id]) {
            for (const version of versions) {
                if (this.addPackageVersion(version, parent)) {
                    allowedVersions.push(version)
                }
            }
            // for all the versions require at most one of them
            this.solver.require(Logic.exactlyOne(...versions.map(v => v.id)))
            this.loadedCache[pkg.id] = true
        }
    }

    public async expand(): Promise<boolean> {
        if (isDefined(this.assumptions)) {
            this.solution = this.solver.solveAssuming(Logic.and(...this.assumptions))

            // the assumptions were falsified
            if (!isDefined(this.solution)) {
                this.solution = this.solver.solve()
            }
        } else {
            this.solution = this.solver.solve()
        }

        // no valid solution exists in the solution space
        if (!isDefined(this.solution)) {
            throw new Error('NO solution was found')
        }
        //this.solution.ignoreUnknownVariables()
        const solution = this.solver.minimizeWeightedSum(
            this.solution,
            this.weights.terms,
            this.weights.weights
        )
        this.assumptions = solution.getTrueVars()

        let open = false
        if (isDefined(this.assumptions)) {
            for (const assumption of this.assumptions) {
                open = open || (await this.expandTerm(assumption))
            }
        } else {
            // todo define solve strategy
        }
        return open ? this.expand() : false
    }

    public async optimize() // : Promise<SATSolution>
    {
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

    private addPackageVersion(version: PackageVersion, usage?: ParentUsage): boolean {
        if (!this.versionMap.has(version.id)) {
            this.versionMap.set(version.id, version)
            this.weights.terms.push(version.id)
            this.weights.weights.push(version.cost)
        }

        if (usage) {
            return version.addUsage(usage)
        }

        return true
    }

    private async expandTerm(term: string): Promise<boolean> {
        const version = this.versionMap.get(term)!
        if (!version.expanded) {
            version.expanded = true

            const definition = await version.getDefinition()

            for (const required of definition.packages) {
                await this.addEntry(required, version)
            }

            return true
        }
        return false
    }

    private async addEntry(entry: InternalDefinitionEntry, addedBy: PackageVersion) {
        const found = this.registries.search(entry)
        if (found.package) {
            await this.addPackage(found.package, { entry, addedBy })
        } else {
            logger.warn(`Failed to find '${entry.type}' package '${found.name}'`)
        }
    }

    private getLockFilePath() {
        return join(environment.directory.workingdir, '.zpm.lock')
    }
}
