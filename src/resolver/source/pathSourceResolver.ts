import { SourceResolver } from '~/resolver/source/sourceResolver'
import { PathDefinitionResolver } from '../definition/pathDefinitionResolver'

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
}
