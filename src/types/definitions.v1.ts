/* tslint:disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

/**
 * This interface was referenced by `DefinitionsSchema`'s JSON-Schema
 * via the `definition` "RegistryDefinition".
 */
export type RegistryDefinition = RegistryNamedLocationEntry | RegistryPathLocationEntry
/**
 * This interface was referenced by `DefinitionsSchema`'s JSON-Schema
 * via the `definition` "RegistryEntry".
 */
export type RegistryEntry =
    | RegistryGDGSEntry
    | RegistryGDPSEntry
    | RegistryPDGSEntry
    | RegistryPSSubEntry

export interface DefinitionsSchema {
    [k: string]: any
}
/**
 * This interface was referenced by `DefinitionsSchema`'s JSON-Schema
 * via the `definition` "ManifestOptions".
 */
export interface ManifestOptions {
    schema?: string
    isBuildDefinition?: boolean
    settingsPath?: string
    defaults?: {
        [k: string]: any
    }
    [k: string]: any
}
/**
 * This interface was referenced by `DefinitionsSchema`'s JSON-Schema
 * via the `definition` "RegistryNamedLocationEntry".
 */
export interface RegistryNamedLocationEntry {
    url: string
    branch?: string
}
/**
 * This interface was referenced by `DefinitionsSchema`'s JSON-Schema
 * via the `definition` "RegistryPathLocationEntry".
 */
export interface RegistryPathLocationEntry {
    path: string
    name: string
    workingDirectory?: string
}
/**
 * This interface was referenced by `DefinitionsSchema`'s JSON-Schema
 * via the `definition` "RegistryGDGSEntry".
 */
export interface RegistryGDGSEntry {
    name: string
    repository: string
    definition?: string
}
/**
 * This interface was referenced by `DefinitionsSchema`'s JSON-Schema
 * via the `definition` "RegistryGDPSEntry".
 */
export interface RegistryGDPSEntry {
    definition: string
    path: string
}
/**
 * This interface was referenced by `DefinitionsSchema`'s JSON-Schema
 * via the `definition` "RegistryPDGSEntry".
 */
export interface RegistryPDGSEntry {
    name: string
    repository: string
    definition: string
}
/**
 * This interface was referenced by `DefinitionsSchema`'s JSON-Schema
 * via the `definition` "RegistryPSSubEntry".
 */
export interface RegistryPSSubEntry {
    name: string
    path?: string
}
/**
 * This interface was referenced by `DefinitionsSchema`'s JSON-Schema
 * via the `definition` "RegistryPDPSEntry".
 */
export interface RegistryPDPSEntry {}
