import { Package } from "../registry/package";
import { NamedLock, PathLock } from "../types/lockfile.v1";
import { Builder } from './builder';
export declare const enum PackageType {
    NAMED = 0,
    ROOT = 1,
    PATH = 2
}
export interface BuilderOptions {
    root?: BasePackageBuilder;
    type: PackageType;
}
export declare class BasePackageBuilder {
    lock: NamedLock | PathLock;
    package: Package;
    options: BuilderOptions;
    builder: Builder;
    used: boolean;
    constructor(builder: Builder, pkg: Package, lock: NamedLock | PathLock, options?: Partial<BuilderOptions>);
    build(type: string): Promise<boolean>;
    getTargetPath(): string;
    getHash(): string | undefined;
}
export declare class PackageBuilder extends BasePackageBuilder {
    run(target: BasePackageBuilder): Promise<boolean>;
    finish(): Promise<boolean>;
}
