import { Package } from "../../registry/package";
import { RegistryEntry, RegistryNamedEntry, RegistryPathEntry } from "../../types/definitions.v1";
import { SourceResolver } from './sourceResolver';
export declare function isNamedEntry(entry: RegistryEntry): entry is RegistryNamedEntry;
export declare function isPathEntry(entry: RegistryEntry): entry is RegistryPathEntry;
export declare function createSourceResolver(entry: RegistryEntry, pkg: Package): SourceResolver;
