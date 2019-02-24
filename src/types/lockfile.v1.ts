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
    named: {
        /**
         * This interface was referenced by `undefined`'s JSON-Schema definition
         * via the `patternProperty` "\w+".
         */
        [k: string]: NamedLock[]
    }
}
export interface GitLock {
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
export interface PathLock {
    root: string
    path: string
    name: string
    settings: {
        /**
         * This interface was referenced by `undefined`'s JSON-Schema definition
         * via the `patternProperty` "\w+".
         */
        [k: string]: any
    }
}
export interface NamedLock {
    name: string
    version: string
    hash: string
    path: string
    settings: {
        /**
         * This interface was referenced by `undefined`'s JSON-Schema definition
         * via the `patternProperty` "\w+".
         */
        [k: string]: any
    }
}
