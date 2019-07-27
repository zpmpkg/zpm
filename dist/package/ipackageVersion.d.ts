import { PackageDefinitionSummary } from "../resolver/definition/definition";
import { IPackage, PackageVersion, ParentUsage } from './internal';
import { SourceVersion } from './sourceVersion';
export declare abstract class IPackageVersion {
    id: string;
    version: PackageVersion;
    protected _package: IPackage;
    constructor(pkg: IPackage, id: string);
    readonly package: IPackage;
    getVersion(): SourceVersion | undefined;
    abstract addUsage(usage: ParentUsage): boolean;
    abstract getDefinition(parent: PackageVersion): Promise<PackageDefinitionSummary>;
    abstract getTargetPath(): string | undefined;
    abstract getBuildPath(): string;
    abstract getCost(): number;
}
