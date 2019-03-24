import { has } from 'lodash'
import { GitLock, PathLock } from '~/types/lockfile.v1'

export function isPathLock(entry: any): entry is PathLock {
    return !has(entry, 'hash')
}
export function isGitLock(entry: any): entry is GitLock {
    return has(entry, 'hash')
}
