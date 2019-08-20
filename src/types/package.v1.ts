export type PackageSchema = PackageFileDefinition | PackageSchemas
export type PackageFileDefinition =
    | PackageDefinition
    | {
          packages?: {
              [k: string]: PackageDefinition
          }
      }
/**
 * This interface was referenced by `PackageEntries`'s JSON-Schema definition
 * via the `patternProperty` "\w+".
 */
export type PackageSingularArrayEntry = PackageEntry[] | PackageEntry
export type PackageEntry =
    | PackageGDGSEntry
    | PackageGDSubGSEntry
    | PackageGDPSEntry
    | PackagePDPSEntry
    | PackagePDGSEntry
    | PackageGSSubEntry
    | PackagePSSubEntry
    | PackagePSSubNameEntry

/**
 * This interface was referenced by `undefined`'s JSON-Schema definition
 * via the `patternProperty` "\w+".
 */
export interface PackageDefinition {
    development?: PackageEntries
    requires?: PackageEntries
    [k: string]: any
}
export interface PackageEntries {
    [k: string]: PackageSingularArrayEntry
}
export interface PackageGDGSEntry {
    name: string
    repository?: string
    definition?: string
    version: string
    optional?: boolean
    settings?: PackageSettings
}
export interface PackageSettings {
    /**
     * This interface was referenced by `PackageSettings`'s JSON-Schema definition
     * via the `patternProperty` "\w+".
     */
    [k: string]: any[]
}
export interface PackageGDSubGSEntry {
    name: string
    repository?: string
    definition?: string
    definitionPath: string
    version: string
    optional?: boolean
    settings?: PackageSettings
}
export interface PackageGDPSEntry {
    definition: string
    path: string
    optional?: boolean
    settings?: PackageSettings
}
export interface PackagePDPSEntry {
    optional?: boolean
    settings?: PackageSettings
}
export interface PackagePDGSEntry {
    name: string
    definition: string
    repository?: string
    version: string
    optional?: boolean
    settings?: PackageSettings
}
export interface PackageGSSubEntry {
    name: string
    path?: string
    definition?: string
    version: string
    optional?: boolean
    settings?: PackageSettings
}
export interface PackagePSSubEntry {
    name?: string
    path: string
    optional?: boolean
    settings?: PackageSettings
}
export interface PackagePSSubNameEntry {
    name: string
    optional?: boolean
    settings?: PackageSettings
}
export interface PackageSchemas {
    versions: string
    definition: PackageFileDefinition
}
