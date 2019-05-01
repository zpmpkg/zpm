import { Version } from '~/common/version'
import { Package } from '~/registry/package'
import { DefinitionResolver } from '../definition/definitionResolver'

export interface SourceVersions {
    version: Version
    name: string
    hash: string
}

export abstract class SourceResolver {
    public definitionResolver!: DefinitionResolver
    public repository: string
    public definition?: string

    public package: Package

    constructor(repository: string, definition: string | undefined, pkg: Package) {
        this.repository = repository
        this.definition = definition
        this.package = pkg
    }

    public abstract async load(): Promise<boolean>

    public abstract getDefinitionPath(): string

    public abstract getRepositoryPath(): string

    public abstract isDefinitionSeparate(): boolean

    public abstract async getVersions(): Promise<SourceVersions[]>

    public abstract getPath(): string

    public abstract getName(): string
}
