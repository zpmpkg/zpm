import * as Logic from 'logic-solver'
import { Package } from '~/registry/package'
import { get, set, unzip, concat, reverse, isEmpty } from 'lodash'
import { SourceVersions } from '~/resolver/source/sourceResolver'
import { Version } from '~/common/version'
import { isDefined } from '~/common/util'
import * as Parallel from 'async-parallel'
import { PackageDefinitionSummary } from '~/resolver/definition/packageDefinition'
import { logger } from '~/common/logger'

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

export class SATSolver {
    public solver = new Logic.Solver()
    public loadedCache: { [k: string]: boolean } = {}
    public versions: { [k: string]: string } = {}

    public weights: SATWeights = { terms: [], weights: [] }

    public solution: any

    public async addPackage(pkg: Package) {
        const hash = pkg.getHash()
        console.log('%%%%%%%%%%%%%%', hash)
        if (this.tryInsertPackage(hash)) {
            const versions = await pkg.resolver.getVersions()
            this.addPackageVersions(hash, versions)

            if (versions.length > 0) {
                await Parallel.each(versions, async v => {
                    console.log(this.toTerm(hash, v.version))
                    await this.addDefinition(
                        this.toTerm(hash, v.version),
                        await pkg.resolver.definitionResolver.getPackageDefinition(v.hash)
                    )
                })
            } else {
                await this.addDefinition(
                    hash,
                    await pkg.resolver.definitionResolver.getPackageDefinition()
                )
            }
            //await this.addDefinition(hash, pkg.resolver.definitionResolver.getPackageDefinition())
        }
    }

    public async addDefinition(hash: string, definition: PackageDefinitionSummary) {
        //this.solver.require(Logic.implies(hash))
        logger.info(hash, definition, '@@@')
        this.addPackageRequirements({
            hash,
            required: [] /*definition.packages.public.map(p => {})*/,
        })
    }

    public solve() {
        this.solution = this.solver.solve()
    }

    public optimize() {
        console.log(
            this.solver
                .minimizeWeightedSum(this.solution, this.weights.terms, this.weights.weights)
                .getMap()
        )
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

        //onsole.log(this.solver.solve().getMap())
    }

    public addPackageVersions(hash: string, versions: SourceVersions[]) {
        const newTerms = unzip(
            reverse(
                versions.map(v => {
                    return [this.toTerm(hash, v.version), v.version.cost]
                })
            )
        )
        if (!isEmpty(newTerms[0]) && !isEmpty(newTerms[1])) {
            this.weights.terms = concat(this.weights.terms || [], newTerms[0] as string[])
            this.weights.weights = concat(this.weights.weights || [], newTerms[1] as number[])
            this.solver.require(Logic.atMostOne(...newTerms[0]))
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
