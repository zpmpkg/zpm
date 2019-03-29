/**
 * This interface was referenced by `undefined`'s JSON-Schema definition
 * via the `patternProperty` "\w+".
 *
 * This interface was referenced by `undefined`'s JSON-Schema definition
 * via the `patternProperty` "\w+".
 */
export type UsageEntryLock = string[] | string

export interface LockfileSchema {
    named: {
        /**
         * This interface was referenced by `undefined`'s JSON-Schema definition
         * via the `patternProperty` "\w+".
         */
        [k: string]: NamedLock[]
    }
    path: {
        /**
         * This interface was referenced by `undefined`'s JSON-Schema definition
         * via the `patternProperty` "\w+".
         */
        [k: string]: PathLock[]
    }
}
export interface NamedLock {
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
    description: {
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
    settings?: {
        /**
         * This interface was referenced by `undefined`'s JSON-Schema definition
         * via the `patternProperty` "\w+".
         */
        [k: string]: {
            /**
             * This interface was referenced by `undefined`'s JSON-Schema definition
             * via the `patternProperty` "\w+".
             */
            [k: string]: any
        }
    }
}
export interface PathLock {
    id: string
    usage?: UsageLock
    name: string
    path: string
    root?: string
    settings: {
        /**
         * This interface was referenced by `undefined`'s JSON-Schema definition
         * via the `patternProperty` "\w+".
         */
        [k: string]: any
    }
    description: {
        /**
         * This interface was referenced by `undefined`'s JSON-Schema definition
         * via the `patternProperty` "\w+".
         */
        [k: string]: any
    }
}
