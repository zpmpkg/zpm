import { Package } from '~/registry/package'
import { Entry } from '~/types/definitions.v1'
import { GitSourceResolver } from './gitSourceResolver'
import { SourceResolver } from './sourceResolver'

export function createSourceResolver(entry: Entry, pkg: Package): SourceResolver {
    return new GitSourceResolver(entry.repository, entry.definition, pkg)
}
