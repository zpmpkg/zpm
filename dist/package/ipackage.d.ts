import { IPackageVersion, Package } from './internal';
import { PackageType } from './type';
export declare abstract class IPackage {
    readonly package: Package;
    constructor(pkg: Package);
    abstract getVersions(): Promise<IPackageVersion[]>;
    load(): Promise<boolean>;
    readonly entry: import("./entry").InternalEntry;
    readonly id: string;
    readonly type: PackageType;
    readonly info: import("./info").PackageInfo<import("./entry").InternalEntry, import("./info").PackageInfoOptions>;
}
