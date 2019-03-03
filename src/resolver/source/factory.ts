import { has } from 'lodash'
import { Package } from '~/registry/package'
import { RegistryEntry, RegistryGitEntry, RegistryPathEntry } from '~/types/definitions.v1'
import { GitSourceResolver } from './gitSourceResolver'
import { PathSourceResolver } from './pathSourceResolver'
import { SourceResolver } from './sourceResolver'

export function isGitEntry(entry: RegistryEntry): entry is RegistryGitEntry {
    return has(entry, 'repository') && !has(entry, 'path')
}
export function isPathEntry(entry: RegistryEntry): entry is RegistryPathEntry {
    return has(entry, 'name') || has(entry, 'path')
}

export function createSourceResolver(entry: RegistryEntry, pkg: Package): SourceResolver {
    if (isGitEntry(entry)) {
        return new GitSourceResolver(entry.repository, entry.definition, pkg)
    } else if (isPathEntry(entry)) {
        return new PathSourceResolver(entry.path, entry.path, pkg)
    } else {
        throw new Error(`Failed to determine solver type ${JSON.stringify(entry)}`)
    }
}
