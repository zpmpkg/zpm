import { NamedLock, PathLock } from "../types/lockfile.v1";
export declare function isPathLock(entry: any): entry is PathLock;
export declare function isNamedLock(entry: any): entry is NamedLock;
