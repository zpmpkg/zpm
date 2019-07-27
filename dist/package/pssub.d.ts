import { PackageDefinitionSummary } from "../resolver/definition/definition";
import { IPackage, IPackageVersion, PackageVersion, ParentUsage, PSSubPackageInfo } from './internal';
export declare class PSSubPackageVersion extends IPackageVersion {
    getDefinition(parent: PackageVersion): Promise<PackageDefinitionSummary>;
    getCost(): number;
    getTargetPath(): string | undefined;
    getBuildPath(): string;
    readonly package: PSSubPackage;
    addUsage(usage: ParentUsage): boolean;
}
export declare class PSSubPackage extends IPackage {
    getVersions(): Promise<IPackageVersion[]>;
    readonly info: PSSubPackageInfo;
}
