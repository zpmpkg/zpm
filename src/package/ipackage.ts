import { IPackageVersion, Package } from './internal'
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
