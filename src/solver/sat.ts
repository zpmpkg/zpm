import { get } from '@zefiros/axioms'
import merge from 'deeply'
import { pathExists } from 'fs-extra'
import { alg, Graph } from 'graphlib'
import { isEmpty } from 'lodash'
import * as Logic from 'logic-solver'
import { join } from 'upath'
import { update } from '~/cli/program'
import { environment } from '~/common/environment'
import { loadJson, writeJson } from '~/common/io'
import { logger } from '~/common/logger'
import { isDefined } from '~/common/util'
import { buildSchema, validateSchema } from '~/common/validation'
import {
    InternalDefinitionEntry,
    InternalDefinitionEntryType,
    internalDefinitionSubToInternalEntry,
    overrideInternalDefinitionOptions,
    overrideInternalDefinitionToInternalEntry,
    Package,
    PackageVersion,
    ParentUsage,
} from '~/package/internal'
import { Registries } from '~/registry/registries'
import { lockFileV1 } from '~/schemas/schemas'
import { LockFile, UsedByVersion, VersionLock } from '~/types/lockfile.v1'
import { version } from 'winston';

export interface SATWeights {
    terms: string[]
    weights: number[]
}

export class SATSolver {
    public solver = new Logic.Solver()

    public weights: SATWeights = { terms: [], weights: [] }
    public loadedCache: { [k: string]: boolean | undefined } = {}
    public solution: any

    public registries: Registries
    public assumptions: string[] | undefined
    public lock?: LockFile
    private lockValidator = buildSchema(lockFileV1)

    constructor(registries: Registries) {
        this.registries = registries
    }

    public async load(): Promise<boolean> {
        this.lock = await this.getLockFile()

        try {
            if (isDefined(this.lock)) {
                
                const graph = new Graph()
                for (const m of this.lock.versions) {
                    graph.setNode(m.versionId, m)
                }
                for (const node of this.lock.versions) {
                    for (const from of node.dependsOn || []) {
                        graph.setEdge(from, node.versionId)
                    }
                }
                const sorted = alg.topsort(graph)
                const components: string[][] = []
                for (const subgraph of alg.components(graph)) {
                    const dependsOn = sorted.filter(value => -1 !== subgraph.indexOf(value))
                    const distances = alg.dijkstra(graph, dependsOn[0])
                    for (const [id, prop] of Object.entries(distances)) {
                        if (!components[prop.distance]) {
                            components[prop.distance] = []
                        }
                        components[prop.distance].push(id)                        
                    }
                }

                this.assumptions = []
                for (const layer of components) {
                    if (isEmpty(layer)) {
                        continue
                    }
                    // do a bfs parallel layer processing
                    await Promise.all(layer.map(async versionId => {
                        const version = graph.node(versionId)
                        const found = this.registries.searchByName(version.manifest, version.packageId)
                        if (isDefined(found)) {
                            await this.addPackage(found)
                            await this.expandTerm(versionId)
                            this.assumptions!.push(versionId)
                        } else {
                            logger.warn(`failure ${versionId}`)
                            // @todo
                        }
                    }))
                }
            }
        } catch (error) {
            logger.error(error)
            this.lock = undefined
        }
        return true
    }

    public async save(): Promise<void> {
        if (isDefined(this.lock)) {
            await writeJson(this.getLockFilePath(), this.lock)
        }
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
            if (allowedTerms.length > 0) {
                logger.debug(`Add constraint ${parent.addedBy.id} => [${allowedTerms.join(', ')}]`)
                this.solver.require(
                    Logic.implies(parent.addedBy.id, Logic.exactlyOne(...allowedTerms))
                )
            }
        }
    }

    public addNewPackage(
        pkg: Package,
        versions: PackageVersion[],
        parent: ParentUsage | undefined,
        allowedVersions: PackageVersion[]
    ) {
        for (const version of versions) {
            if (this.addPackageVersion(version, parent)) {
                allowedVersions.push(version)
                if (parent) {
                    version.dependsOn.push(parent.addedBy.id)
                }
            }
        }
        if (!this.loadedCache[pkg.id]) {
            // for all the versions require at most one of them
            this.solver.require(Logic.exactlyOne(...versions.map(v => v.id)))
            this.loadedCache[pkg.id] = true
        }
    }

    public async expand(): Promise<boolean> {
        logger.debug(`Expanding current solution`)
        if (isDefined(this.assumptions)) {
            this.solution = this.solver.solveAssuming(Logic.and(...this.assumptions))

            // the assumptions were falsified
            if (!isDefined(this.solution)) {
                this.solution = this.solver.solve()
            }
        } else {
            this.solution = this.solver.solve()
        }

        if (!this.solution) {
            await this.expand()
        }

        // no valid solution exists in the solution space
        if (!isDefined(this.solution)) {
            throw new Error('NO solution was found')
        }

        const solution = Logic.disablingAssertions(() =>
            this.solver.minimizeWeightedSum(this.solution, this.weights.terms, this.weights.weights)
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

    public async optimize(): Promise<LockFile | undefined> {
        if (isDefined(this.assumptions) && !isDefined(this.solution)) {
            this.solution = this.solver.solveAssuming(Logic.and(...this.assumptions))
        }
        if (!isDefined(this.solution) || update()) {
            logger.info(`Updating solution`)
            await this.expand()
        }

        if (!isDefined(this.solution)) {
            throw new Error('NO solution was found')
        }

        if (!this.assumptions) {
            return undefined
        }
        const nodes = new Map<string, VersionLock>()
        const graph = new Graph()

        for (const m of this.assumptions) {
            const version = this.registries.getVersion(m)
            if (version) {
                const dependsOn = version.dependsOn.filter(value => -1 !== this.assumptions!.indexOf(value))

                const versionLock: VersionLock = {
                    versionId: m,
                    packageId: version.package.info.name,
                    manifest: version.package.info.manifest,
                    version: version.version,
                    usedBy: this.getUsedByLock(version, this.assumptions),
                    settings: {},
                    // the definion is defined since the version is already loaded and expanded
                    definition: get(version.definition, ['definition']) || {},
                    dependsOn: !isEmpty(dependsOn) ? dependsOn : undefined,
                }
                nodes.set(m, versionLock)
                graph.setNode(m)
            } else {
                // @todo
            }
        }
        for (const node of nodes.values()) {
            for (const from of node.dependsOn || []) {
                graph.setEdge(from, node.versionId)
            }
        }
        const sorted = alg.topsort(graph)
        // reverse because we want the most important values to be merged last (no overwrites)
        const preorder = alg.preorder(graph, [sorted[0]]).reverse()
        const versions: VersionLock[] = []

        const context = {
            useCustomAdapters: merge.behaviors.useCustomAdapters,
            array: merge.adapters.arraysAppendUnique,
        }
        for (const key of sorted) {
            const node = nodes.get(key)!
            const usedBy = node.usedBy.map(u => u.versionId)
            const settingsOrder = preorder.filter(value => -1 !== usedBy.indexOf(value))
            node.settings = merge.call(
                context,
                {},
                ...node.usedBy
                    .sort(
                        (a, b) =>
                            settingsOrder.indexOf(a.versionId) - settingsOrder.indexOf(b.versionId)
                    )
                    .map(u => u.settings)
                    .filter(isDefined)
            )
            versions.push(node)
        }

        const lock: LockFile = {
            // make the lock file stable
            // order doesnt matter because we do a topo sort when we load the file
            versions: versions.sort((a, b) => (a.versionId > b.versionId) ? 1 : -1),
        }
        this.lock = lock
        return lock
    }

    public getUsedByLock(version: PackageVersion, minimum: string[]) {
        const builderDefinitionsUsed: Map<string, boolean> = new Map()
        const usedByVersions: UsedByVersion[] = []
        for (const [usedBy, usage] of Object.entries(version.usedBy).filter(([isUsedBy]) =>
            minimum.includes(isUsedBy)
        )) {
            const found = this.registries.getVersion(usedBy)
            if (found) {
                const isBuildDefinition =
                    found.package.package.manifest.options.isBuildDefinition === true

                const packageType = found.package.package.manifest.type
                if (isBuildDefinition) {
                    if (builderDefinitionsUsed.has(packageType)) {
                        throw new Error(`Singular package type ${packageType} has multiple values`)
                    }
                    builderDefinitionsUsed.set(packageType, true)
                }

                usedByVersions.push({
                    versionId: usedBy,
                    optional: usage.optional,
                    ...(isEmpty(usage.settings) ? {} : { settings: usage.settings }),
                })
            } else {
                // @todo
            }
        }
        return usedByVersions
    }

    public async getLockFile(): Promise<LockFile | undefined> {
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
        if (this.registries.addVersion(version.id, version)) {
            logger.debug(`Add package version ${version.id}`)
            this.weights.terms.push(version.id)
            this.weights.weights.push(version.cost)
        }

        if (usage) {
            return version.addUsage(usage)
        }

        return true
    }

    private async expandTerm(term: string): Promise<boolean> {
        const version = this.registries.getVersion(term)
        if (!isDefined(version)) {
            // @todo
            throw new Error(`Term ${term} not found`)
        }
        if (!version.expanded) {
            version.expanded = true

            logger.debug(`Expanding term ${term}`)
            const definition = await version.getDefinition(version)

            for (const required of definition.packages) {
                await this.addEntry(required, version)
            }

            return true
        }
        return false
    }

    private async addEntry(entry: InternalDefinitionEntry, addedBy: PackageVersion) {
        // if sub package
        if (
            entry.internalDefinitionType === InternalDefinitionEntryType.PSSub ||
            entry.internalDefinitionType === InternalDefinitionEntryType.GSSub
        ) {
            const added = this.registries.addPackage(
                entry.type,
                internalDefinitionSubToInternalEntry(entry),
                entry.options
            )
            await this.addPackage(added.package, { entry, addedBy })
        } else {
            const found = this.registries.search(entry)
            if (!found.sameType && get(addedBy.package.info.options, ['mayChangeRegistry'])) {
                found.package = this.registries.addPackage(
                    entry.type,
                    overrideInternalDefinitionToInternalEntry(
                        entry,
                        found.package ? found.package.info : undefined
                    ),
                    overrideInternalDefinitionOptions(entry.options!, entry, addedBy.package.info),
                    true
                ).package
            }
            if (found.package) {
                await this.addPackage(found.package, { entry, addedBy })
            } else {
                logger.warn(`Failed to find '${entry.type}' package '${found.name}'`)
            }
        }
    }

    private getLockFilePath() {
        return join(environment.directory.workingdir, '.zpm.lock')
    }
}
