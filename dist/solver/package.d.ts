import { PackageEntry, PackageGitEntry, PackagePathEntry } from "../types/package.v1";
export declare function isGitPackageEntry(entry: PackageEntry): entry is PackageGitEntry;
export declare function isPathPackageEntry(entry: PackageEntry): entry is PackagePathEntry;
