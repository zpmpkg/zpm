export type PackageSchema =
    | PackageDefinition
    | {
          versions: string
          definition: PackageDefinition
      }
export type PackageEntry = PackageGitEntry | PackagePathEntry

export interface PackageDefinition {
    development?: PackageEntries
    requires?: PackageEntries
    [k: string]: any
}
export interface PackageEntries {
    /**
     * This interface was referenced by `PackageEntries`'s JSON-Schema definition
     * via the `patternProperty` "\w+".
     */
    [k: string]: PackageEntry[]
}
export interface PackageGitEntry {
    name: string
    version: string
    settings?: {
        /**
         * This interface was referenced by `undefined`'s JSON-Schema definition
         * via the `patternProperty` "\w+".
         */
        [k: string]: PackageEntry[]
    }
}
export interface PackagePathEntry {
    path: string
    settings?: {
        /**
         * This interface was referenced by `undefined`'s JSON-Schema definition
         * via the `patternProperty` "\w+".
         */
        [k: string]: PackageEntry[]
    }
}
