import { Manifest } from "../registry/package";
import { IPackage, PackageInfo, PackageVersion } from './internal';
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
