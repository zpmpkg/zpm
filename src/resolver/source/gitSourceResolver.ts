import * as fs from 'fs-extra'
import ora from 'ora'
import { join } from 'upath'
import { update } from '~/cli/program'
import { environment } from '~/common/environment'
import {
    cloneOrFetch,
    CloneOrFetchResult,
    cloneOrPull,
    CloneOrPullResult,
    showRef,
} from '~/common/git'
import { copy } from '~/common/io'
import { logger } from '~/common/logger'
import { isDefined } from '~/common/util'
import { Version } from '~/common/version'
import { SourceResolver } from '~/resolver/source/sourceResolver'
import { GitDefinitionResolver } from '../definition/gitDefinitionResolver'
import { PathDefinitionResolver } from '../definition/pathDefinitionResolver'

export class GitSourceResolver extends SourceResolver {
    public loaded = false
    public async load(): Promise<void> {
        if (this.loaded) {
            return
        }
        this.loaded = true

        this.definitionResolver = this.isDefinitionSeparate()
            ? new PathDefinitionResolver(this)
            : new GitDefinitionResolver(this)
        if (this.mayPull()) {
            const spinner = ora(`Pulling repository ${this.repository}`).start()
            const result = await cloneOrFetch(this.getRepositoryPath(), this.repository)
            spinner.succeed(`Pulled repository '${this.repository}' ${this.getFetchInfo(result)}`)
        }

        if (this.mayPull()) {
            const spinner = ora(`Pulling definition ${this.definition}`).start()
            const result = await cloneOrPull(this.getDefinitionPath(), this.definition!)
            spinner.succeed(`Pulled definition '${this.definition}' ${this.getPullInfo(result)}`)
        }
    }
    public getName(): string {
        return 'GIT'
    }

    public getDefinitionPath(): string {
        return join(this.getCachePath(), 'definition')
    }

    public getRepositoryPath(): string {
        return join(this.getCachePath(), 'repository')
    }

    public isDefinitionSeparate(): boolean {
        return this.definition !== this.repository && this.definition !== undefined
    }

    public async getVersions() {
        // we need to be certain we have the repository
        await this.load()

        const output = await showRef(this.getRepositoryPath(), ['--tags'])
        return output
            .split('\n')
            .map(s => s.split(' '))
            .filter(s => s.length === 2)
            .map(s => {
                let result
                try {
                    result = {
                        version: new Version(s[1].replace('refs/tags/', '')),
                        hash: s[0],
                        name: s[1].replace('refs/tags/', ''),
                    }
                } catch (error) {
                    result = undefined
                }
                return result
            })
            .filter(isDefined)
    }

    public async getTags() {
        const output = await showRef(this.getRepositoryPath(), ['--heads'])
        return output
            .split('\n')
            .map(s => s.split(' '))
            .filter(s => s.length === 2)
            .map(s => {
                let result
                try {
                    result = {
                        version: new Version(s[1].replace('refs/heads/', '')),
                        hash: s[0],
                        name: s[1].replace('refs/heads/', ''),
                    }
                } catch (error) {
                    result = undefined
                }
                return result
            })
            .filter(isDefined)
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
                await fs.remove(this.getExtractionPath())
                await fs.ensureDir(this.getExtractionPath())
                await copy(
                    (await this.definitionResolver.getPackageDefinition(hash)).includes,
                    this.getRepositoryPath(),
                    this.getExtractionPath()
                )
                await this.writeExtractionHash(hash)
            } catch (err) {
                logger.error(err)
            }
        }
    }

    public mayPull() {
        return update()
    }

    private getPullInfo(fetched: CloneOrPullResult): string {
        if (!fetched.cloned) {
            if (fetched.newCommits) {
                return `(${fetched.newCommits} new commits)`
            }
            return '(no changes)'
        }
        return '(cloned)'
    }
    private getFetchInfo(fetched: CloneOrFetchResult): string {
        if (!fetched.cloned) {
            if (fetched.newCommits) {
                return `(${fetched.newCommits} new commits)`
            }
            return '(no changes)'
        }
        return '(cloned)'
    }
}
