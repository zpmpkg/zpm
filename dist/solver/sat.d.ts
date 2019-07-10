import { Package, PackageVersion, ParentUsage } from "../package/package";
import { Registries } from "../registry/registries";
import { LockfileSchema } from "../types/lockfile.v1";
export interface SATWeights {
    terms: string[];
    weights: number[];
}
export interface SATRequirements {
    term?: string;
    required?: string[][];
    optional?: string[][];
}
export declare class SATSolver {
    solver: any;
    weights: SATWeights;
    loadedCache: {
        [k: string]: boolean | undefined;
    };
    versionMap: Map<string, PackageVersion>;
    solution: any;
    registries: Registries;
    assumptions: string[] | undefined;
    minimize: boolean;
    private lockValidator;
    constructor(registries: Registries);
    load(): Promise<boolean>;
    save(): Promise<void>;
    rollback(): Promise<void>;
    addPackage(pkg: Package, parent?: ParentUsage): Promise<void>;
    expand(): Promise<boolean>;
    optimize(): Promise<void>;
    getLockFile(): Promise<LockfileSchema | undefined>;
    private addPackageVersion;
    private expandTerm;
    private addEntry;
    private getLockFilePath;
}
