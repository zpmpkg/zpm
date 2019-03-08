/**
 * This interface was referenced by `undefined`'s JSON-Schema definition
 * via the `patternProperty` "\w+".
 *
 * This interface was referenced by `undefined`'s JSON-Schema definition
 * via the `patternProperty` "\w+".
 */
export type UsageEntryLock = string[] | string

export interface LockfileSchema {
    git: {
        /**
         * This interface was referenced by `undefined`'s JSON-Schema definition
         * via the `patternProperty` "\w+".
         */
        [k: string]: GitLock[]
    }
    path: {
        /**
         * This interface was referenced by `undefined`'s JSON-Schema definition
         * via the `patternProperty` "\w+".
         */
        [k: string]: PathLock[]
    }
}
export interface GitLock {
    id: string
    usage?: UsageLock
    name: string
    version: string
    hash: string
    settings: {
        /**
         * This interface was referenced by `undefined`'s JSON-Schema definition
         * via the `patternProperty` "\w+".
         */
        [k: string]: any
    }
}
export interface UsageLock {
    required?: {
        [k: string]: UsageEntryLock
    }
    optional?: {
        [k: string]: UsageEntryLock
    }
}
export interface PathLock {
    id: string
    usage?: UsageLock
    name: string
    path: string
    settings: {
        /**
         * This interface was referenced by `undefined`'s JSON-Schema definition
         * via the `patternProperty` "\w+".
         */
        [k: string]: any
    }
}
