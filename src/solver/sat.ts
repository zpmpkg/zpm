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
import { Package, PackageVersion } from '~/package/package'
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

    public async addPackage(pkg: Package, addedBy?: PackageVersion) {
        const versions = await pkg.getVersions()

        for (const version of versions) {
            this.addPackageVersion(version)
        }

        this.solver.require(Logic.exactlyOne(...versions.map(v => v.id)))
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
        this.solution.ignoreUnknownVariables()
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

    private addPackageVersion(version: PackageVersion) {
        this.versionMap.set(version.id, version)
        this.weights.terms.push(version.id)
        this.weights.weights.push(version.cost)
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
            await this.addPackage(found.package)
        } else {
            logger.warn(`Failed to find '${entry.type}' package '${found.name}'`)
        }
    }

    private getLockFilePath() {
        return join(environment.directory.workingdir, '.zpm.lock')
    }

    private mayLoadPackage(hash: string): boolean {
        if (!this.loadedCache[hash]) {
            this.loadedCache[hash] = false
            return true
        }
        return false
    }
}
