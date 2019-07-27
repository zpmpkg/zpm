export type PackageSchema =
    | PackageDefinition
    | {
          versions: string
          definition: PackageDefinition
      }
/**
 * This interface was referenced by `PackageEntries`'s JSON-Schema definition
 * via the `patternProperty` "\w+".
 */
export type PackageSingularArrayEntry = PackageEntry[] | PackageEntry
export type PackageEntry =
    | PackageGDGSEntry
    | PackageGDPSEntry
    | PackagePDPSEntry
    | PackagePDGSEntry
    | PackageGSSubEntry
    | PackagePSSubEntry
    | PackagePSSubNameEntry

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
