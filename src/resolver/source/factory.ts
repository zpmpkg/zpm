import { has } from 'lodash'
import { Package } from '~/registry/package'
import { RegistryEntry, RegistryNamedEntry } from '~/types/definitions.v1'
import { GitSourceResolver } from './gitSourceResolver'
import { PathSourceResolver } from './pathSourceResolver'
import { SourceResolver } from './sourceResolver'

export function isNamedEntry(entry: RegistryEntry): entry is RegistryNamedEntry {
    return has(entry, 'repository') && !has(entry, 'path')
}
export function isPathEntry(entry: RegistryEntry): entry is RegistryNamedEntry {
    return has(entry, 'name') || has(entry, 'path')
}

export function createSourceResolver(entry: RegistryEntry, pkg: Package): SourceResolver {
    if (isNamedEntry(entry)) {
        return new GitSourceResolver(entry.repository, entry.definition, pkg)
    } else if (isPathEntry(entry)) {
        return new PathSourceResolver(entry.path, entry.path, pkg)
    } else {
        throw new Error(`Failed to determine solver type ${JSON.stringify(entry)}`)
    }
}
