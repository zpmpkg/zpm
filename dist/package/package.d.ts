import { Manifest } from "../registry/package";
import { PackageDefinitionSummary } from "../resolver/definition/packageDefinition";
import { PackageInfo, PDPSPackageInfo } from './info';
import { PackageType } from './type';
export declare abstract class IPackage {
    readonly package: Package;
    constructor(pkg: Package);
    abstract getVersions(): Promise<IPackageVersion[]>;
    readonly entry: import("./entry").InternalEntry;
    readonly id: string;
    readonly type: PackageType;
    readonly info: PackageInfo<import("./entry").InternalEntry, import("./info").PackageInfoOptions>;
}
export declare class Package {
    readonly manifest: Manifest;
    readonly impl: IPackage;
    readonly info: PackageInfo;
    versions?: PackageVersion[];
    constructor(manifest: Manifest, info: PackageInfo);
    createPackageType(): IPackage;
    load(): Promise<void>;
    getVersions(): Promise<PackageVersion[]>;
    readonly id: string;
}
export declare abstract class IPackageVersion {
    id: string;
    constructor(id: string);
    abstract getDefinition(): Promise<PackageDefinitionSummary>;
    abstract getCost(): number;
}
export declare class PackageVersion {
    readonly impl: IPackageVersion;
    private definition?;
    constructor(impl: IPackageVersion);
    readonly id: string;
    readonly cost: number;
    getDefinition(): Promise<PackageDefinitionSummary>;
}
export declare class PDPSPackageVersion extends IPackageVersion {
    package: PDPSPackage;
    constructor(pkg: PDPSPackage, id: string);
    getDefinition(): Promise<PackageDefinitionSummary>;
    getCost(): number;
}
export declare class PDPSPackage extends IPackage {
    getVersions(): Promise<IPackageVersion[]>;
    readonly info: PDPSPackageInfo;
}
