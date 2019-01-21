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
    name: string
    version: string
    hash: string
}
export interface PathLock {
    root: string
    path: string
    name: string
}
