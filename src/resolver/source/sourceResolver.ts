import * as fs from 'fs-extra'
import { join } from 'upath'
import { force } from '~/cli/program'
import { environment } from '~/common/environment'
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

    public abstract async load(): Promise<void>
    public abstract async extract(hash?: string): Promise<void>

    public abstract getDefinitionPath(): string

    public abstract getRepositoryPath(): string

    public abstract isDefinitionSeparate(): boolean

    public abstract async getVersions(): Promise<SourceVersions[]>

    public abstract async getTags(): Promise<SourceVersions[]>

    public abstract getPath(): string

    public abstract getName(): string

    public getExtractionPath(): string {
        return join(
            environment.directory.extract,
            this.package.manifest.type,
            this.package.vendor,
            this.package.name
        )
    }

    public async needsExtraction(hash?: string) {
        const file = this.getExtractionHashPath()
        if (!force() && (await fs.pathExists(file)) && hash) {
            return (await fs.readFile(file)).toString() !== hash
        }
        return true
    }

    public async writeExtractionHash(hash?: string) {
        if (hash) {
            await fs.writeFile(this.getExtractionHashPath(), hash)
        }
    }

    public getExtractionHashPath(): string {
        return join(
            environment.directory.extract,
            this.package.manifest.type,
            this.package.vendor,
            this.package.name,
            '.EXTRACTION_HASH'
        )
    }
}
