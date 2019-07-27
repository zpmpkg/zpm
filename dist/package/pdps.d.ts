import { PackageDefinitionSummary } from "../resolver/definition/definition";
import { IPackage, IPackageVersion, PackageVersion, ParentUsage, PDPSPackageInfo } from './internal';
export declare class PDPSPackageVersion extends IPackageVersion {
    getDefinition(parent: PackageVersion): Promise<PackageDefinitionSummary>;
    getCost(): number;
    getTargetPath(): string | undefined;
    getBuildPath(): string;
    readonly package: PDPSPackage;
    addUsage(usage: ParentUsage): boolean;
}
export declare class PDPSPackage extends IPackage {
    getVersions(): Promise<IPackageVersion[]>;
    readonly info: PDPSPackageInfo;
}
