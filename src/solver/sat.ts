import { concat, flatten, get, isEmpty, reverse, set, toPairs, unzip } from 'lodash'
import * as Logic from 'logic-solver'
import { VersionRange } from '~/common/range'
import { isDefined } from '~/common/util'
import { Version } from '~/common/version'
import { Package } from '~/registry/package'
import { Registries } from '~/registry/registries'
import { PackageDefinitionSummary } from '~/resolver/definition/packageDefinition'
import { SourceVersions } from '~/resolver/source/sourceResolver'

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

    public registries: Registries

    constructor(registries: Registries) {
        this.registries = registries
    }

    public async addPackage(pkg: Package): Promise<SourceVersions[]> {
        const hash = pkg.getHash()
        // console.log('%%%%%%%%%%%%%%', hash)
        if (this.tryInsertPackage(hash)) {
            const versions = await pkg.resolver.getVersions()
            // console.log(versions)
            this.addPackageVersions(hash, versions)

            if (versions.length > 0) {
                await Promise.all(
                    versions.map(async v => {
                        await this.addDefinition(
                            this.toTerm(hash, v.version),
                            await pkg.resolver.definitionResolver.getPackageDefinition(v.hash)
                        )
                    })
                )
            } else {
                await this.addDefinition(
                    hash,
                    await pkg.resolver.definitionResolver.getPackageDefinition()
                )
                this.solver.require(Logic.exactlyOne(hash))
            }
            // await this.addDefinition(hash, pkg.resolver.definitionResolver.getPackageDefinition())
            return versions
        }
        return pkg.resolver.getVersions()
    }

    public async addDefinition(hash: string, definition: PackageDefinitionSummary) {
        // this.solver.require(Logic.implies(hash))
        // logger.info(hash, definition, '@@@')

        await Promise.all(
            flatten(
                toPairs(definition.packages).map(p =>
                    p[1].map(e => ({ name: e.name, version: e.version, type: p[0] }))
                )
            ).map(async pkg => {
                const found = get(this.registries.manifests, [pkg.type, 'entries', pkg.name])
                if (found) {
                    const versions = await this.addPackage(found)
                    const range = new VersionRange(pkg.version)
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
                // console.log(hash, pkg, this.solver)
            })
        )
    }

    public solve() {
        this.solution = this.solver.solve()
        console.log(this.solution.getTrueVars())
    }

    public optimize() {
        console.log(
            this.solver
                .minimizeWeightedSum(this.solution, this.weights.terms, this.weights.weights)
                .getTrueVars()
        )
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
