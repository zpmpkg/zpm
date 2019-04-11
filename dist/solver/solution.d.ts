import { UsageLock } from "../types/lockfile.v1";
export interface SATGitPackage {
    id: string;
    name: string;
    version: string;
    hash: string;
    settings: any;
    description: {
        [k: string]: any;
    };
    usage?: UsageLock;
}
export interface SATPathPackage {
    id: string;
    path: string;
    name: string;
    settings: any;
    root?: string;
    description: {
        [k: string]: any;
    };
    usage?: UsageLock;
}
export interface SATSolution {
    named: {
        [k: string]: SATGitPackage[];
    };
    path: {
        [k: string]: SATPathPackage[];
    };
}
