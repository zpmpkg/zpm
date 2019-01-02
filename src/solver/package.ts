import { has } from 'lodash'
import { PackageEntry, PackageGitEntry, PackagePathEntry } from '~/types/package.v1'

export function isGitPackageEntry(entry: PackageEntry): entry is PackageGitEntry {
    return has(entry, 'version')
}
export function isPathPackageEntry(entry: PackageEntry): entry is PackagePathEntry {
    return has(entry, 'path')
}
