import { Manifest } from "../registry/package";
import { PackageDefinitionSummary } from "../resolver/definition/packageDefinition";
import { PackageInfo, PDPSPackageInfo, PSSubPackageInfo, GDGSPackageInfo } from './info';
import { PackageType } from './type';
import { InternalDefinitionEntry } from './entry';
export declare abstract class IPackage {
    readonly package: Package;
    constructor(pkg: Package);
    abstract getVersions(): Promise<IPackageVersion[]>;
    load(): Promise<boolean>;
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
    loaded: boolean;
    constructor(manifest: Manifest, info: PackageInfo);
    createPackageType(): IPackage;
    load(): Promise<boolean>;
    getVersions(): Promise<PackageVersion[]>;
    readonly id: string;
}
export declare abstract class IPackageVersion {
    id: string;
    version: PackageVersion;
    protected _package: IPackage;
    constructor(pkg: IPackage, id: string);
    readonly package: IPackage;
    abstract addUsage(usage: ParentUsage): boolean;
    abstract getDefinition(): Promise<PackageDefinitionSummary>;
    abstract getCost(): number;
}
export interface ParentUsage {
    entry: InternalDefinitionEntry;
    addedBy: PackageVersion;
}
export interface PackageVersionUsage {
    [k: string]: {
        settings: any;
        optional: boolean;
    };
}
export declare class PackageVersion {
    readonly impl: IPackageVersion;
    expanded: boolean;
    usageBy: PackageVersionUsage;
    private definition?;
    constructor(impl: IPackageVersion);
    readonly id: string;
    readonly package: IPackage;
    readonly cost: number;
    getDefinition(): Promise<PackageDefinitionSummary>;
    addUsage(usage: ParentUsage): boolean;
}
export declare abstract class PathPackage extends IPackage {
    addUsage(usage: ParentUsage): void;
}
export declare class PDPSPackageVersion extends IPackageVersion {
    getDefinition(): Promise<PackageDefinitionSummary>;
    getCost(): number;
    readonly package: PDPSPackage;
    addUsage(usage: ParentUsage): boolean;
}
export declare class PDPSPackage extends PathPackage {
    getVersions(): Promise<IPackageVersion[]>;
    readonly info: PDPSPackageInfo;
}
export declare class PSSubPackageVersion extends IPackageVersion {
    getDefinition(): Promise<PackageDefinitionSummary>;
    getCost(): number;
    readonly package: PSSubPackage;
    addUsage(usage: ParentUsage): boolean;
}
export declare class PSSubPackage extends PathPackage {
    getVersions(): Promise<IPackageVersion[]>;
    readonly info: PSSubPackageInfo;
}
export declare class GDGSPackageVersion extends IPackageVersion {
    constructor(pkg: IPackage, id: string);
    getDefinition(): Promise<PackageDefinitionSummary>;
    readonly package: GDGSPackage;
    getCost(): number;
    addUsage(usage: ParentUsage): boolean;
}
export declare class GDGSPackage extends IPackage {
    load(): Promise<boolean>;
    getVersions(): Promise<IPackageVersion[]>;
    readonly info: GDGSPackageInfo;
    addUsage(usage: ParentUsage): void;
}
