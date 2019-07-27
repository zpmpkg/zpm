import { Package } from "../registry/package";
import { Registries } from "../registry/registries";
import { PackageDefinitionSummary, PackageDescription } from "../resolver/definition/definition";
import { SourceVersions } from "../resolver/source/sourceResolver";
import { LockfileSchema, UsageLock } from "../types/lockfile.v1";
import { PackageGitEntry, PackagePathEntry } from "../types/package.v1";
import { SATSolution } from './solution';
export interface SATOptions {
    branchHeuristic: boolean;
}
export interface SATWeights {
    terms: string[];
    weights: number[];
}
export interface SATRequirements {
    hash?: string;
    required?: string[][];
    optional?: string[][];
}
export interface SATGitEntry {
    description: PackageGitEntry;
    definitionPath: string;
    type: string;
    optional: boolean;
}
export interface SATPathEntry {
    description: PackagePathEntry;
    definitionPath: string;
    type: string;
    optional: boolean;
}
export interface SATUsage {
    required: {
        [k: string]: string[][];
    };
    optional: {
        [k: string]: string[][];
    };
}
export declare class SATSolver {
    solver: any;
    loadedCache: {
        [k: string]: boolean;
    };
    versions: {
        [k: string]: string;
    };
    termMap: {
        named: {
            [k: string]: {
                package: Package;
                version: string;
                hash: string;
                description: PackageDescription;
                usage: SATUsage;
                settings: {
                    [k: string]: any;
                };
            };
        };
        path: {
            [k: string]: {
                package: Package;
                description: PackageDescription;
                usage: SATUsage;
                root?: string;
                settings: {
                    [k: string]: any;
                };
            };
        };
    };
    weights: SATWeights;
    solution: any;
    lockContent: LockfileSchema | undefined;
    registries: Registries;
    assumptions: string[] | undefined;
    minimize: boolean;
    private lockValidator;
    constructor(registries: Registries);
    load(): Promise<boolean>;
    save(): Promise<void>;
    rollback(): Promise<void>;
    addPackage(pkg: Package, extra?: any): Promise<SourceVersions[]>;
    addDefinition(hash: string, definition: PackageDefinitionSummary, parent?: {
        package: Package;
        hash: string;
    }): Promise<SATUsage>;
    optimize(): Promise<SATSolution>;
    filterUsage(usage: SATUsage, minimum: string[], pathOrNamed: 'named' | 'path', id: string): UsageLock | undefined;
    buildBranch(minimum: string[], term: string, type: string): any;
    countParents(minimum: string[], parent: string, depth?: number): number;
    addPackageRequirements(value: SATRequirements): void;
    addPackageVersions(hash: string, versions: SourceVersions[], pkg: Package): Promise<{
        versions: Array<{
            version: SourceVersions;
            term: string;
            added: boolean;
        }>;
    }>;
    getLockFile(): Promise<LockfileSchema | undefined>;
    private getLockFilePath;
    private addPathEntry;
    private addNamedPathEntry;
    private addNamedEntry;
    private tryInsertPackage;
    private unlockPackage;
    private toTerm;
}
