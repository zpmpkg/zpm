import { isDefined } from '@zefiros/axioms/is-defined'
import { isUndefined } from 'util'
import { settledPromiseAll } from '~/common/async'
import { logger } from '~/common/logger'
import { Version } from '~/common/version'
import { Manifest } from '~/registry/package'
import { getGitPackageDefinition } from '~/resolver/definition/git'
import { PackageDefinitionSummary } from '~/resolver/definition/definition'
import { getPathPackageDefinition } from '~/resolver/definition/path'
import { GitVersion, listVersions as listGitVersions } from '~/resolver/source/git'
import {
    InternalDefinitionEntry,
    InternalDefinitionGDGSEntry,
    InternalDefinitionPDPSEntry,
    InternalDefinitionPSSubEntry,
} from './entry'
import { GDGSPackageInfo, PackageInfo, PDPSPackageInfo, PSSubPackageInfo } from './info'
import { createRepository } from './repository'
import { PackageType } from './type'

export abstract class IPackage {
    public readonly package: Package

    public constructor(pkg: Package) {
        this.package = pkg
    }

    public abstract async getVersions(): Promise<IPackageVersion[]>

    public async load(): Promise<boolean> {
        return true
    }

    public get entry() {
        return this.info.entry
    }

    public get id(): string {
        return this.info.id
    }

    public get type(): PackageType {
        return this.info.type
    }

    public get info() {
        return this.package.info
    }
}

export class Package {
    public readonly manifest: Manifest
    public readonly impl: IPackage
    public readonly info: PackageInfo

    public versions?: PackageVersion[] = undefined
    public loaded: boolean = false

    constructor(manifest: Manifest, info: PackageInfo) {
        this.manifest = manifest
        this.info = info
        this.impl = this.createPackageType()
    }
    public createPackageType(): IPackage {
        switch (this.info.type) {
            case PackageType.PDPS:
                return new PDPSPackage(this)
            case PackageType.PSSub:
                return new PSSubPackage(this)
            case PackageType.GDGS:
                return new GDGSPackage(this)

            default:
                throw new Error(`${this.info.type} not implemented`)
        }
    }

    public async load(): Promise<boolean> {
        if (!this.loaded) {
            this.loaded = await this.impl.load()
        }
        return this.loaded
    }

    public async getVersions(): Promise<PackageVersion[]> {
        if (isUndefined(this.versions)) {
            await this.impl.load()

            this.versions = (await this.impl.getVersions()).map(v => {
                const version = new PackageVersion(v)
                v.version = version
                return version
            })
        }
        return this.versions
    }

    public get id(): string {
        return this.info.id
    }
}

export abstract class IPackageVersion {
    public id: string
    public version!: PackageVersion
    protected _package: IPackage
    public constructor(pkg: IPackage, id: string) {
        this._package = pkg
        this.id = id
    }

    public get package(): IPackage {
        return this._package
    }

    public abstract addUsage(usage: ParentUsage): boolean

    public abstract async getDefinition(): Promise<PackageDefinitionSummary>
    public abstract getCost(): number
}

export interface ParentUsage {
    entry: InternalDefinitionEntry
    addedBy: PackageVersion
}

export interface PackageVersionUsage {
    [k: string]: {
        settings: any
        optional: boolean
    }
}

export class PackageVersion {
    public readonly impl: IPackageVersion
    public expanded: boolean

    public usageBy: PackageVersionUsage

    private definition?: PackageDefinitionSummary = undefined

    public constructor(impl: IPackageVersion) {
        this.impl = impl
        this.usageBy = {}
        this.expanded = false
    }

    public get id(): string {
        return this.impl.id
    }

    public get package(): IPackage {
        return this.impl.package
    }

    public get cost(): number {
        return this.impl.getCost()
    }

    public async getDefinition(): Promise<PackageDefinitionSummary> {
        if (isUndefined(this.definition)) {
            this.definition = await this.impl.getDefinition()
        }
        return this.definition
    }

    public addUsage(usage: ParentUsage) {
        return this.impl.addUsage(usage)
    }
}

export abstract class PathPackage extends IPackage {
    public addUsage(): void {
        throw new Error('Method not implemented.')
    }
}

export class PDPSPackageVersion extends IPackageVersion {
    public async getDefinition(): Promise<PackageDefinitionSummary> {
        logger.logfile.info(
            `Trying to read '${this.package.info.entry.path}' from '${
                this.package.info.directories.definition
            }`
        )
        return getPathPackageDefinition(this.package)
    }

    public getCost(): number {
        return Version.versionInverse - Version.majorVersionCost
    }

    public get package(): PDPSPackage {
        return this._package as PDPSPackage
    }

    public addUsage(usage: ParentUsage): boolean {
        const entry = usage.entry as InternalDefinitionPDPSEntry

        if (!isDefined(this.version.usageBy[usage.addedBy.id])) {
            this.version.usageBy[usage.addedBy.id] = {
                settings: entry.usage.settings,
                optional: isDefined(entry.usage.optional) ? entry.usage.optional : false,
            }
        }
        return true
    }
}

export class PDPSPackage extends PathPackage {
    public async getVersions(): Promise<IPackageVersion[]> {
        return [new PDPSPackageVersion(this, this.id)]
    }

    public get info(): PDPSPackageInfo {
        return this.package.info as PDPSPackageInfo
    }
}

export class PSSubPackageVersion extends IPackageVersion {
    public async getDefinition(): Promise<PackageDefinitionSummary> {
        logger.logfile.info(
            `Trying to read '${this.package.info.entry.path}' from '${
                this.package.info.directories.definition
            }`
        )
        return getPathPackageDefinition(this.package)
    }

    public getCost(): number {
        return Version.versionInverse - Version.majorVersionCost
    }

    public get package(): PSSubPackage {
        return this._package as PSSubPackage
    }

    public addUsage(usage: ParentUsage): boolean {
        const entry = usage.entry as InternalDefinitionPSSubEntry

        if (!isDefined(this.version.usageBy[usage.addedBy.id])) {
            this.version.usageBy[usage.addedBy.id] = {
                settings: entry.usage.settings,
                optional: isDefined(entry.usage.optional) ? entry.usage.optional : false,
            }
        }
        return true
    }
}

export class PSSubPackage extends PathPackage {
    public async getVersions(): Promise<IPackageVersion[]> {
        return [new PSSubPackageVersion(this, this.id)]
    }

    public get info(): PSSubPackageInfo {
        return this.package.info as PSSubPackageInfo
    }
}

export class GDGSPackageVersion extends IPackageVersion {
    public gitVersion: GitVersion
    public constructor(pkg: IPackage, id: string, gitVersion: GitVersion) {
        super(pkg, id)
        this.gitVersion = gitVersion
    }

    public async getDefinition(): Promise<PackageDefinitionSummary> {
        logger.logfile.info(`Trying to read '${this.package.info.entry.repository}' definition`)
        return getGitPackageDefinition(this.package, this.gitVersion)
    }

    public get package(): GDGSPackage {
        return this._package as GDGSPackage
    }

    public getCost(): number {
        return this.gitVersion.version.cost
    }

    public addUsage(usage: ParentUsage): boolean {
        const entry = usage.entry as InternalDefinitionGDGSEntry

        if (entry.usage.version.satisfies(this.gitVersion.version)) {
            if (!isDefined(this.version.usageBy[usage.addedBy.id])) {
                this.version.usageBy[usage.addedBy.id] = {
                    settings: entry.usage.settings,
                    optional: isDefined(entry.usage.optional) ? entry.usage.optional : false,
                }
            }
            return true
        }
        return false
    }
}

export class GDGSPackage extends IPackage {
    public async load(): Promise<boolean> {
        const promises = [
            createRepository(this.info.directories.source, this.info.entry.repository).cloneOrFetch(
                `repository '${this.info.name}'`
            ),
        ]

        if (isDefined(this.info.entry.definition)) {
            promises.push(
                createRepository(
                    this.info.directories.definition,
                    this.info.entry.definition
                ).cloneOrFetch(`repository '${this.info.name}'`)
            )
        }
        await settledPromiseAll(promises)
        return true
    }

    public async getVersions(): Promise<IPackageVersion[]> {
        const fversions = await listGitVersions(this.info.directories.source)

        return fversions.map(v => new GDGSPackageVersion(this, this.id, v))
    }

    public get info(): GDGSPackageInfo {
        return this.package.info as GDGSPackageInfo
    }
}
