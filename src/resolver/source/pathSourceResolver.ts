import { join, normalizeSafe } from 'upath'
import { SourceResolver } from '~/resolver/source/sourceResolver'
import { PathDefinitionResolver } from '../definition/pathDefinitionResolver'
import { isPathEntry } from './factory'

export class PathSourceResolver extends SourceResolver {
    public async load(): Promise<void> {
        this.definitionResolver = new PathDefinitionResolver(this)
    }
    public getName(): string {
        return 'PATH'
    }

    public async extract(hash?: string): Promise<void> {
        //
    }

    public getDefinitionPath(): string {
        if (this.package.options.parent) {
            return normalizeSafe(
                join(
                    this.package.options.parent.resolver.getDefinitionPath(),
                    this.definition || this.repository
                )
            )
        }
        return this.definition || this.repository
    }

    public getRepositoryPath(): string {
        return this.repository
    }

    public isDefinitionSeparate(): boolean {
        return this.definition !== this.repository && this.definition !== undefined
    }

    public async getVersions() {
        return []
    }

    public async getTags() {
        return []
    }

    public getPath(): string {
        if (isPathEntry(this.package.entry)) {
            if (this.package.options.parent) {
                return normalizeSafe(
                    `${this.package.options.parent.resolver.getPath()}/${this.package.entry.path}`
                )
            }
            return this.package.entry.path
        } else {
            throw new Error('not implemented')
        }
    }
}
