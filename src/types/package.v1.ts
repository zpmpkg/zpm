export type PackageSchema =
    | PackageDefinition
    | {
          versions: string
          definition: PackageDefinition
      }

export interface PackageDefinition {
    includes: string[]
    development?: {
        public?: PackageEntries
        private?: PackageEntries
    }
    production?: {
        public?: PackageEntries
        private?: PackageEntries
    }
    [k: string]: any
}
export interface PackageEntries {
    /**
     * This interface was referenced by `PackageEntries`'s JSON-Schema definition
     * via the `patternProperty` "\w+".
     */
    [k: string]: PackageEntry[]
}
export interface PackageEntry {
    name: string
    version: string
    definition?: string
}
