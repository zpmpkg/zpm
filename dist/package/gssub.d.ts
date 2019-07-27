import { PackageDefinitionSummary } from "../resolver/definition/definition";
import { IPackage, IPackageVersion, PackageVersion, ParentUsage, GSSubPackageInfo } from './internal';
export declare class GSSubPackageVersion extends IPackageVersion {
    getDefinition(parent: PackageVersion): Promise<PackageDefinitionSummary>;
    getCost(): number;
    getTargetPath(): string | undefined;
    getBuildPath(): string;
    readonly package: GSSubPackage;
    addUsage(usage: ParentUsage): boolean;
}
export declare class GSSubPackage extends IPackage {
    load(): Promise<boolean>;
    getVersions(): Promise<IPackageVersion[]>;
    readonly info: GSSubPackageInfo;
}
