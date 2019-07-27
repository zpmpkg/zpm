import { PackageDefinitionSummary } from '~/resolver/definition/definition'
import { IPackage, PackageVersion, ParentUsage } from './internal'
import { SourceVersion } from './sourceVersion'

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

    public getVersion(): SourceVersion | undefined {
        return undefined
    }

    public abstract addUsage(usage: ParentUsage): boolean

    public abstract async getDefinition(parent: PackageVersion): Promise<PackageDefinitionSummary>

    public abstract getTargetPath(): string | undefined
    public abstract getBuildPath(): string

    public abstract getCost(): number
}
