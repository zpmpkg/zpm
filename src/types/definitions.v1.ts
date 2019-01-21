/* tslint:disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

/**
 * This interface was referenced by `DefinitionsSchema`'s JSON-Schema
 * via the `definition` "RegistryEntry".
 */
export type RegistryEntry = RegistryGitEntry | RegistryPathEntry

export interface DefinitionsSchema {
    [k: string]: any
}
/**
 * This interface was referenced by `DefinitionsSchema`'s JSON-Schema
 * via the `definition` "RegistryDefinition".
 */
export interface RegistryDefinition {
    url: string
    branch?: string
}
/**
 * This interface was referenced by `DefinitionsSchema`'s JSON-Schema
 * via the `definition` "RegistryGitEntry".
 */
export interface RegistryGitEntry {
    name: string
    repository: string
    definition?: string
}
/**
 * This interface was referenced by `DefinitionsSchema`'s JSON-Schema
 * via the `definition` "RegistryPathEntry".
 */
export interface RegistryPathEntry {
    path: string
}
