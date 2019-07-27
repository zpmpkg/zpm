import { InternalDefinitionEntry, InternalEntry, Package, PackageInfoOptions, PackageVersion } from "../package/internal";
import { ConfigurationSchema } from "../types/configuration.v1";
import { RegistryDefinition, RegistryNamedLocationEntry, RegistryPathLocationEntry } from "../types/definitions.v1";
import { ZPM } from "../zpm";
import { Manifest } from './package';
import { Registry } from './registry';
export declare function isPathRegistry(entry: RegistryDefinition): entry is RegistryPathLocationEntry;
export declare function isNamedRegistry(entry: RegistryDefinition): entry is RegistryNamedLocationEntry;
export declare class Registries {
    zpm: ZPM;
    registries: Registry[];
    config: ConfigurationSchema;
    versions: Map<string, PackageVersion>;
    private manifests;
    constructor(zpm: ZPM);
    load(): Promise<void>;
    getTypes(): string[];
    getRegistries(): {
        name: string;
        options?: import("../types/definitions.v1").ManifestOptions | undefined;
    }[];
    getManifest(type: string): Manifest;
    getVersion(id: string): PackageVersion | undefined;
    addVersion(id: string, version: PackageVersion): boolean;
    search(entry: InternalDefinitionEntry): {
        package: Package | undefined;
        name: string;
        sameType: boolean;
    };
    searchByName(type: string, name: string): Package | undefined;
    addPackage<E extends InternalEntry, O extends PackageInfoOptions>(type: string, entry: E, options?: O, force?: boolean): {
        name: string;
        alias: string | undefined;
        package: Package;
    };
    private loadManifests;
    private findRegistries;
}
