import { Package, PackageVersion, ParentUsage } from "../package/internal";
import { Registries } from "../registry/registries";
import { LockFile, UsedByVersion } from "../types/lockfile.v1";
export interface SATWeights {
    terms: string[];
    weights: number[];
}
export declare class SATSolver {
    solver: any;
    weights: SATWeights;
    loadedCache: {
        [k: string]: boolean | undefined;
    };
    solution: any;
    registries: Registries;
    assumptions: string[] | undefined;
    minimize: boolean;
    lock?: LockFile;
    private lockValidator;
    constructor(registries: Registries);
    load(): Promise<boolean>;
    save(): Promise<void>;
    addPackage(pkg: Package, parent?: ParentUsage): Promise<void>;
    addVersionConstraints(parent: ParentUsage | undefined, allowedVersions: PackageVersion[]): void;
    addNewPackage(pkg: Package, versions: PackageVersion[], parent: ParentUsage | undefined, allowedVersions: PackageVersion[]): void;
    expand(): Promise<boolean>;
    optimize(): Promise<LockFile | undefined>;
    getUsedByLock(version: PackageVersion, minimum: string[]): UsedByVersion[];
    getLockFile(): Promise<LockFile | undefined>;
    private addPackageVersion;
    private expandTerm;
    private addEntry;
    private getLockFilePath;
}
