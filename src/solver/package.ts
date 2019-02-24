import { get, has } from 'lodash'
import {
    PackageEntry,
    PackageGitEntry,
    PackageNamedPathEntry,
    PackagePathEntry,
} from '~/types/package.v1'

export function isGitPackageEntry(entry: PackageEntry): entry is PackageGitEntry {
    return has(entry, 'name') && get(entry, 'name').indexOf(':') === -1 && !has(entry, 'path')
}

export function isNamedPathPackageEntry(entry: PackageEntry): entry is PackageNamedPathEntry {
    return has(entry, 'name') && (get(entry, 'name').indexOf(':') > -1 || has(entry, 'path'))
}

export function isPathPackageEntry(entry: PackageEntry): entry is PackagePathEntry {
    return has(entry, 'path') && !has(entry, 'name') && get(entry, 'name', '').indexOf(':') === -1
}
