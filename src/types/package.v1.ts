export interface PackageSchema {
    includes: string[]
    development?: {
        public?: PackageEntries
        private?: PackageEntries
    }
    production?: {
        public?: PackageEntries
        private?: PackageEntries
    }
}
export interface PackageEntries {
    libraries?: PackageEntry[]
}
export interface PackageEntry {
    name: string
    version: string
}
