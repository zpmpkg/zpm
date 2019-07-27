import { PackageDefinitionSummary } from "../resolver/definition/definition";
import { InternalEntry, IPackage, IPackageVersion, PackageVersionUsage, ParentUsage } from './internal';
import { SourceVersion } from './sourceVersion';
export declare class PackageVersion {
    readonly impl: IPackageVersion;
    expanded: boolean;
    usedBy: PackageVersionUsage;
    definition?: PackageDefinitionSummary;
    dependsOn: string[];
    constructor(impl: IPackageVersion);
    readonly id: string;
    readonly package: IPackage;
    readonly cost: number;
    readonly version: SourceVersion | undefined;
    readonly entry: InternalEntry;
    readonly targetPath: string | undefined;
    readonly buildPath: string;
    getDefinition(parent: PackageVersion): Promise<PackageDefinitionSummary>;
    addUsage(usage: ParentUsage): boolean;
}
