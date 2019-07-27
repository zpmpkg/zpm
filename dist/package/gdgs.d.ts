import { PackageDefinitionSummary } from "../resolver/definition/definition";
import { GitVersion } from "../resolver/source/git";
import { GDGSPackageInfo } from './info';
import { IPackage, IPackageVersion, PackageVersion, ParentUsage } from './internal';
import { SourceVersion } from './sourceVersion';
export declare class GDGSPackageVersion extends IPackageVersion {
    gitVersion: GitVersion;
    constructor(pkg: IPackage, id: string, gitVersion: GitVersion);
    getDefinition(parent: PackageVersion): Promise<PackageDefinitionSummary>;
    getVersion(): SourceVersion | undefined;
    getTargetPath(): string | undefined;
    getBuildPath(): string;
    readonly package: GDGSPackage;
    getCost(): number;
    addUsage(usage: ParentUsage): boolean;
}
export declare class GDGSPackage extends IPackage {
    load(): Promise<boolean>;
    getVersions(): Promise<IPackageVersion[]>;
    readonly info: GDGSPackageInfo;
}
