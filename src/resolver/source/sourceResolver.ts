import { Package } from '~/registry/package'

export abstract class SourceResolver {
    public repository: string
    public definition?: string

    public package: Package

    constructor(repository: string, definition: string, pkg: Package) {
        this.repository = repository
        this.definition = definition
        this.package = pkg
    }

    public abstract async load(): Promise<void>
    public abstract async extract(hash?: string): Promise<void>

    public abstract getDefinitionPath(): string

    public abstract getRepositoryPath(): string

    public abstract getExtractionPath(): string
}
