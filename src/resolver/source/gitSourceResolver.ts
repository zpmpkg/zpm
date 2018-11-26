import { exists, writeFile, readFile } from 'async-file'
import { readFileSync, remove } from 'fs-extra'
import { join } from 'upath'
import { force, update } from '~/cli/program'
import { environment } from '~/common/environment'
import { cloneOrFetch } from '~/common/git'
import { copy } from '~/common/io'
import { SourceResolver } from '~/resolver/source/sourceResolver'
import { DefinitionResolver } from '../definition/definitionResolver'
import { logger } from '~/common/logger'

export class GitSourceResolver extends SourceResolver {
    public definitionResolver: DefinitionResolver

    public async load(): Promise<void> {
        if (this.mayPull()) {
            await cloneOrFetch(this.getRepositoryPath(), this.repository)
            if (this.definition !== this.repository) {
                await cloneOrFetch(this.getDefinitionPath(), this.definition)
            }
        }

        this.definitionResolver = new DefinitionResolver(this)
    }

    public getDefinitionPath(): string {
        return join(this.getCachePath(), 'definition')
    }

    public getRepositoryPath(): string {
        return join(this.getCachePath(), 'repository')
    }

    public getExtractionPath(): string {
        return join(
            environment.directory.extract,
            this.package.manifest.type,
            this.package.vendor,
            this.package.name
        )
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

    public getCachePath() {
        return join(
            environment.directory.packages,
            this.package.manifest.type,
            this.package.vendor,
            this.package.name
        )
    }

    public async extract(hash?: string): Promise<void> {
        if (await this.needsExtraction(hash)) {
            try {
                await remove(this.getExtractionPath())
            } catch (err) {
                console.error(err)
            }
            console.log('copy')
            await copy(
                (await this.definitionResolver.getPackageDefinition(hash)).includes,
                this.getRepositoryPath(),
                this.getExtractionPath()
            )
            console.log('hash')
            try {
                await this.writeExtractionHash(hash)
            } catch (err) {
                console.error(err)
            }
            console.log('written')
        }
    }

    public async needsExtraction(hash?: string) {
        const file = this.getExtractionHashPath()
        if (!force() && (await exists(file)) && hash) {
            return (await readFile(file)).toString() !== hash
        }
        return true
    }

    public async writeExtractionHash(hash?: string) {
        if (hash) {
            await writeFile(this.getExtractionHashPath(), hash)
        }
    }

    public mayPull() {
        return update()
    }
}
