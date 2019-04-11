import { SourceResolver } from "../resolver/source/sourceResolver";
import { RegistryEntry } from "../types/definitions.v1";
import { Manifest } from './manifest';
export declare const enum PackageType {
    Path = 0,
    Named = 1
}
export interface PackageOptions {
    type: PackageType;
    parent?: Package;
    root?: Package;
    isRoot?: boolean;
    rootHash?: string;
    forceName?: boolean;
    absolutePath?: string;
}
export declare class Package {
    name: string;
    vendor: string;
    fullName: string;
    source: SourceResolver;
    manifest: Manifest;
    options: PackageOptions;
    entry: RegistryEntry;
    private loaded;
    private loadedEntryHash?;
    private mutex;
    constructor(manifest: Manifest, entry: RegistryEntry, options?: PackageOptions);
    overrideEntry(entry: RegistryEntry): Promise<void>;
    getHash(): string;
    load(): Promise<boolean>;
    getFullName(): string;
    getRootName(): string;
    private calculateEntryHash;
}
