import { isUndefined } from 'util'
import { logger } from '~/common/logger'
import { Version } from '~/common/version'
import { Manifest } from '~/registry/package'
import { PackageDefinitionSummary } from '~/resolver/definition/packageDefinition'
import { getPathPackageDefinition } from '~/resolver/definition/path'
import { PackageInfo, PDPSPackageInfo } from './info'
import { PackageType } from './type'

export abstract class IPackage {
    public readonly package: Package

    public constructor(pkg: Package) {
        this.package = pkg
    }

    public abstract async getVersions(): Promise<IPackageVersion[]>

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

    constructor(manifest: Manifest, info: PackageInfo) {
        this.manifest = manifest
        this.info = info
        this.impl = this.createPackageType()
    }
    public createPackageType(): IPackage {
        switch (this.info.type) {
            case PackageType.PDPS:
                return new PDPSPackage(this)

            default:
                return new PDPSPackage(this)
        }
    }

    public async load() {}

    public async getVersions(): Promise<PackageVersion[]> {
        if (isUndefined(this.versions)) {
            this.versions = (await this.impl.getVersions()).map(v => new PackageVersion(v))
        }
        return this.versions
    }

    public get id(): string {
        return this.info.id
    }
}

export abstract class IPackageVersion {
    public id: string
    protected _package: IPackage
    public constructor(pkg: IPackage, id: string) {
        this._package = pkg
        this.id = id
    }

    public get package(): IPackage {
        return this._package
    }

    public abstract async getDefinition(): Promise<PackageDefinitionSummary>
    public abstract getCost(): number
}

export class PackageVersion {
    public readonly impl: IPackageVersion
    public expanded: boolean
    private definition?: PackageDefinitionSummary = undefined

    public constructor(impl: IPackageVersion) {
        this.impl = impl
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
}

export class PDPSPackageVersion extends IPackageVersion {
    public constructor(pkg: IPackage, id: string) {
        super(pkg, id)
    }

    public async getDefinition(): Promise<PackageDefinitionSummary> {
        logger.logfile.info(
            `Trying to read '${this.package.info.entry.path}' from '${
                this.package.info.directories.definition
            }`
        )
        return getPathPackageDefinition(this.package)
    }

    public get package(): PDPSPackage {
        return this._package as PDPSPackage
    }

    public getCost(): number {
        return Version.versionInverse - Version.majorVersionCost
    }
}

export class PDPSPackage extends IPackage {
    public async getVersions(): Promise<IPackageVersion[]> {
        return [new PDPSPackageVersion(this, this.id)]
    }

    public get info(): PDPSPackageInfo {
        return this.package.info as PDPSPackageInfo
    }
}
