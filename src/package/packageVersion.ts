import { isUndefined } from 'lodash'
import { PackageDefinitionSummary } from '~/resolver/definition/definition'
import {
    InternalEntry,
    IPackage,
    IPackageVersion,
    PackageVersionUsage,
    ParentUsage,
} from './internal'
import { SourceVersion } from './sourceVersion'

export class PackageVersion {
    public readonly impl: IPackageVersion
    public expanded: boolean

    public usedBy: PackageVersionUsage

    public definition?: PackageDefinitionSummary = undefined
    public dependsOn: string[] = []

    public constructor(impl: IPackageVersion) {
        this.impl = impl
        this.usedBy = {}
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

    public get version(): SourceVersion | undefined {
        return this.impl.getVersion()
    }

    public get entry(): InternalEntry {
        return this.package.entry
    }

    public get targetPath(): string | undefined {
        return this.impl.getTargetPath()
    }

    public get buildPath(): string {
        return this.impl.getBuildPath()
    }

    public async getDefinition(parent: PackageVersion): Promise<PackageDefinitionSummary> {
        if (isUndefined(this.definition)) {
            this.definition = await this.impl.getDefinition(parent)
        }
        return this.definition
    }

    public addUsage(usage: ParentUsage) {
        return this.impl.addUsage(usage)
    }
}
