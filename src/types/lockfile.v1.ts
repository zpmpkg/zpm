export interface LockFile {
    versions: VersionLock[]
}
export interface VersionLock {
    versionId: string
    packageId: string
    manifest: string
    version?: {
        hash: string
        name: string
        version: string
    }
    settings: {
        /**
         * This interface was referenced by `undefined`'s JSON-Schema definition
         * via the `patternProperty` "\w+".
         */
        [k: string]: any
    }
    definition: {
        /**
         * This interface was referenced by `undefined`'s JSON-Schema definition
         * via the `patternProperty` "\w+".
         */
        [k: string]: any
    }
    usedBy: UsedByVersion[]
    dependsOn?: string[]
}
export interface UsedByVersion {
    versionId: string
    settings?: {
        /**
         * This interface was referenced by `undefined`'s JSON-Schema definition
         * via the `patternProperty` "\w+".
         */
        [k: string]: any
    }
    optional: boolean
}
