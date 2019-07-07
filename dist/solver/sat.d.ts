import { Package, PackageVersion } from "../package/package";
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
    versionMap: {
        [k: string]: PackageVersion | undefined;
    };
    solution: any;
    registries: Registries;
    assumptions: string[] | undefined;
    minimize: boolean;
    private lockValidator;
    constructor(registries: Registries);
    load(): Promise<boolean>;
    save(): Promise<void>;
    rollback(): Promise<void>;
    addPackage(pkg: Package): Promise<void>;
    expand(): Promise<void>;
    addPackageVersion(version: PackageVersion): Promise<void>;
    optimize(): Promise<void>;
    addPackageRequirements(value: SATRequirements): void;
    getLockFile(): Promise<LockfileSchema | undefined>;
    private expandSolution;
    private getLockFilePath;
    private mayLoadPackage;
}
