import { has } from 'lodash'
import { PackageEntry, PackageGitEntry, PackagePathEntry } from '~/types/package.v1'
import { get } from '@zefiros/axioms'

export function isGitPackageEntry(entry: PackageEntry): entry is PackageGitEntry {
    return has(entry, 'name') && get(entry, ['name'])!.indexOf(':') === -1 && !has(entry, 'path')
}

export function isPathPackageEntry(entry: PackageEntry): entry is PackagePathEntry {
    return has(entry, 'path') || (has(entry, 'name') && get(entry, ['name'])!.indexOf(':') !== -1)
}
