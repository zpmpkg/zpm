import { PackageVersion } from "../package/internal";
import { Registries } from "../registry/registries";
import { LockFile, VersionLock } from "../types/lockfile.v1";
import { IBuilder, PackageBuilder, TargetBuilder } from './packageBuilder';
export declare class Builder {
    registries: Registries;
    lock: LockFile;
    types: string[];
    builderTypes: string[];
    versions: Map<string, PackageBuilder>;
    builders: Map<string, TargetBuilder[]>;
    constructor(registries: Registries, lock: LockFile);
    load(): void;
    build(): Promise<void>;
}
export declare function builderFactory(type: string, builder: Builder, version: PackageVersion, lock: VersionLock): IBuilder;
