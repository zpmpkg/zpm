import { has } from 'lodash'
import { Package } from '~/registry/package'
import {
    RegistryEntry,
    RegistryGitEntry,
    RegistryNamedPathEntry,
    RegistryPathEntry,
} from '~/types/definitions.v1'
import { GitSourceResolver } from './gitSourceResolver'
import { PathSourceResolver } from './pathSourceResolver'
import { SourceResolver } from './sourceResolver'
import { NamedPathSourceResolver } from './namedPathSourceResolver'

export function isGitEntry(entry: RegistryEntry): entry is RegistryGitEntry {
    return has(entry, 'repository') && !has(entry, 'path')
}
export function isPathEntry(entry: RegistryEntry): entry is RegistryPathEntry {
    return has(entry, 'path') && !has(entry, 'name')
}

export function isNamedPathPackageEntry(entry: RegistryEntry): entry is RegistryNamedPathEntry {
    return has(entry, 'name') && has(entry, 'path')
}

export function createSourceResolver(entry: RegistryEntry, pkg: Package): SourceResolver {
    console.log(entry)
    if (isGitEntry(entry)) {
        return new GitSourceResolver(entry.repository, entry.definition, pkg)
    } else if (isNamedPathPackageEntry(entry)) {
        return new NamedPathSourceResolver(entry.path, entry.path, pkg)
    } else if (isPathEntry(entry)) {
        return new PathSourceResolver(entry.path, entry.path, pkg)
    } else {
        throw new Error(`Failed to determine solver type ${JSON.stringify(entry)}`)
    }
}
