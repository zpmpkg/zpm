import { join, normalizeSafe } from 'upath'
import { isDefined } from '~/common/util'
// import { isDefined } from '~/common/util'
import { SourceResolver } from '~/resolver/source/sourceResolver'
import { PathDefinitionResolver } from '../definition/pathDefinitionResolver'
import { isPathEntry } from './factory'

export class PathSourceResolver extends SourceResolver {
    public async load(): Promise<boolean> {
        this.definitionResolver = new PathDefinitionResolver(this)
        return true
    }
    public getName(): string {
        return `PATH:${this.package.entry.name}`
    }

    public async extract(hash?: string): Promise<void> {
        //
    }

    public getDefinitionPath(): string {
        let path = this.definition || this.repository

        if (isDefined(this.package.options.absolutePath)) {
            path = join(this.package.options.absolutePath, path)
        }
        if (this.package.options.root) {
            return normalizeSafe(join(this.package.options.root.resolver.getDefinitionPath(), path))
        }
        return path
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
            if (this.package.options.root) {
                // @todo, check whether escaping sandbox
                const parentPath = this.package.options.root.resolver.getPath()
                if (parentPath !== '$ROOT') {
                    return normalizeSafe(join(parentPath, this.package.entry.path))
                }
                return normalizeSafe(this.package.entry.path)
            }
            return this.package.entry.path
        } else {
            throw new Error('not implemented')
        }
    }
}
