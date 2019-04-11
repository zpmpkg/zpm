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
export type PackageEntry = PackagePathEntry | PackageGitEntry

export interface PackageDefinition {
    development?: PackageEntries
    requires?: PackageEntries
    [k: string]: any
}
export interface PackageEntries {
    [k: string]: PackageSingularArrayEntry
}
export interface PackagePathEntry {
    name?: string
    version?: string
    path: string
    optional?: boolean
    settings?: {
        /**
         * This interface was referenced by `undefined`'s JSON-Schema definition
         * via the `patternProperty` "\w+".
         */
        [k: string]: any
    }
}
export interface PackageGitEntry {
    name: string
    version: string
    repository?: string
    definition?: string
    optional?: boolean
    settings?: {
        /**
         * This interface was referenced by `undefined`'s JSON-Schema definition
         * via the `patternProperty` "\w+".
         */
        [k: string]: any[]
    }
}
