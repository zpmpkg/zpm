import { Spinner } from "../cli/spinner";
import { PackageVersion } from "../package/internal";
import { VersionLock } from "../types/lockfile.v1";
import { Builder } from './builder';
export declare class IBuilder {
    versionLock: VersionLock;
    version: PackageVersion;
    builder: Builder;
    constructor(builder: Builder, version: PackageVersion, versionLock: VersionLock);
    initialize(): Promise<boolean>;
    build(): Promise<boolean>;
}
export declare class PackageBuilder extends IBuilder {
    spin: Spinner;
    constructor(builder: Builder, version: PackageVersion, versionLock: VersionLock);
    finish(): void;
    readonly targetPath: string | undefined;
    readonly buildPath: string;
    readonly sourcePath: string;
    readonly hash: string | undefined;
    readonly needsExtraction: boolean;
}
export declare class TargetBuilder extends IBuilder {
    used: boolean;
    blackboard: Map<string, any>;
    getTargets(): PackageBuilder[];
    initialize(): Promise<boolean>;
    build(): Promise<boolean>;
    store<T extends object>(target: PackageBuilder, obj: T): void;
    get<T extends object>(target: PackageBuilder): T | undefined;
    run(target: PackageBuilder): Promise<boolean>;
    prepare(target: PackageBuilder): Promise<boolean>;
    finish(): Promise<boolean>;
}
