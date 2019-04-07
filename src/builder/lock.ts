import { has } from 'lodash'
import { NamedLock, PathLock } from '~/types/lockfile.v1'

export function isPathLock(entry: any): entry is PathLock {
    return !has(entry, 'hash')
}
export function isNamedLock(entry: any): entry is NamedLock {
    return has(entry, 'hash')
}
