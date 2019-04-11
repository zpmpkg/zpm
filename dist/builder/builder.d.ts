import { Package } from "../registry/package";
import { Registries } from "../registry/registries";
import { LockfileSchema, NamedLock, PathLock } from "../types/lockfile.v1";
import { BuilderOptions, PackageBuilder } from './packageBuilder';
export declare class Builder {
    registries: Registries;
    root: Package;
    lockFile: LockfileSchema;
    types: string[];
    builderTypes: string[];
    packages: PackageBuilder[];
    builders: {
        [k: string]: PackageBuilder;
    };
    tree: any;
    constructor(registries: Registries, root: Package, lockFile: LockfileSchema);
    load(): Promise<void>;
    build(): Promise<void>;
    private createBuilders;
}
export declare function builderFactory(type: string, builder: Builder, pkg: Package, lock: NamedLock | PathLock, options?: Partial<BuilderOptions>): PackageBuilder;
