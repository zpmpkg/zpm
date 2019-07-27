import { PackageDefinitionSummary } from "../resolver/definition/definition";
import { GitVersion } from "../resolver/source/git";
import { IPackage, IPackageVersion, PackageVersion, ParentUsage, PDGSPackageInfo } from './internal';
import { SourceVersion } from './sourceVersion';
export declare class PDGSPackageVersion extends IPackageVersion {
    gitVersion: GitVersion;
    constructor(pkg: IPackage, id: string, gitVersion: GitVersion);
    getDefinition(parent: PackageVersion): Promise<PackageDefinitionSummary>;
    getVersion(): SourceVersion | undefined;
    getCost(): number;
    getTargetPath(): string | undefined;
    getBuildPath(): string;
    readonly package: PDGSPackage;
    addUsage(usage: ParentUsage): boolean;
}
export declare class PDGSPackage extends IPackage {
    load(): Promise<boolean>;
    getVersions(): Promise<IPackageVersion[]>;
    readonly info: PDGSPackageInfo;
}
