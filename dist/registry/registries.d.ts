import { Manifest } from "./manifest";
import { ConfigurationSchema } from "../types/configuration.v1";
import { RegistryDefinition, RegistryEntry, RegistryNamedLocationEntry, RegistryPathLocationEntry } from "../types/definitions.v1";
import { ZPM } from '../zpm';
import { Package, PackageOptions } from './package';
import { Registry } from './registry';
export declare function isPathRegistry(entry: RegistryDefinition): entry is RegistryPathLocationEntry;
export declare function isNamedRegistry(entry: RegistryDefinition): entry is RegistryNamedLocationEntry;
export declare class Registries {
    zpm: ZPM;
    registries: Registry[];
    config: ConfigurationSchema;
    private manifests;
    private addMutex;
    constructor(zpm: ZPM);
    load(): Promise<void>;
    getTypes(): string[];
    getRegistries(): {
        name: string;
        options?: import("../types/definitions.v1").ManifestOptions | undefined;
    }[];
    getManifest(type: string): Manifest;
    searchPackage(type: string, search: {
        name: string;
    } & {
        path?: string;
    } & {
        definition?: string;
        repository?: string;
    }): Promise<Package | undefined>;
    addPackage(type: string, entry: RegistryEntry, options?: PackageOptions): Package;
    private loadManifests;
    private findRegistries;
}
