import * as fs from 'fs-extra'
import { join } from 'upath'
import { askPull } from '~/cli/inquiries'
import { headless, update } from '~/cli/program'
import { spinners } from '~/cli/spinner'
import { environment } from '~/common/environment'
import {
    cloneOrFetch,
    CloneOrFetchResult,
    cloneOrPull,
    CloneOrPullResult,
    showRef,
    hasHash,
    checkout,
} from '~/common/git'
// import { copy } from '~/common/io'
import { logger } from '~/common/logger'
import { isDefined } from '~/common/util'
import { Version } from '~/common/version'
import { SourceResolver } from '~/resolver/source/sourceResolver'
import { GitDefinitionResolver } from '../definition/gitDefinitionResolver'
import { PathDefinitionResolver } from '../definition/pathDefinitionResolver'
import { isGitEntry } from './factory'

export class GitSourceResolver extends SourceResolver {
    public loaded = false
    public async load(): Promise<boolean> {
        if (this.loaded) {
            return true
        }
        this.loaded = true

        this.definitionResolver = this.isDefinitionSeparate()
            ? new PathDefinitionResolver(this)
            : new GitDefinitionResolver(this)
        if (await this.mayPull()) {
            await Promise.all([
                (async () => {
                    const spin = spinners.create(`Pulling repository '${this.package.fullName}':`)
                    const result = await cloneOrFetch(this.getRepositoryPath(), this.repository, {
                        stream: spin.stream,
                    })
                    spin.succeed(
                        `Pulled repository '${this.package.fullName}' ${this.getFetchInfo(result)}`
                    )
                })(),
                (async () => {
                    const spin = spinners.create(`Pulling definition '${this.package.fullName}'`)
                    const result = await cloneOrPull(this.getDefinitionPath(), this.definition!, {
                        stream: spin.stream,
                    })
                    spin.succeed(
                        `Pulled definition '${this.package.fullName}' ${this.getPullInfo(result)}`
                    )
                })(),
            ])
        }
        return this.loaded
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
        if (!(await this.load())) {
            return []
        }

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
            .sort(x => x.version.cost)
            .reverse()
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

    public getPath(): string {
        if (isGitEntry(this.package.entry)) {
            return this.package.entry.name
        } else {
            throw new Error('not implemented')
        }
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
        if (hash && (await this.needsExtraction(hash))) {
            const spin = spinners.create(`Extracting ${this.package.fullName}`)
            try {
                await fs.remove(this.getExtractionPath())
                await fs.ensureDir(this.getExtractionPath())

                if (await this.ensureSourceHash(hash)) {
                    await checkout(this.getRepositoryPath(), hash, { stream: spin.stream })
                    // await copy(
                    //     //     (await this.definitionResolver.getPackageDefinition(hash)).includes,
                    //     ['**/*.h'],
                    //     this.getRepositoryPath(),
                    //     this.getExtractionPath()
                    // )
                } else {
                    logger.error(
                        `Failed to find hash '${hash}' on package '${this.package.fullName}'`
                    )
                }

                //console.log(await this.definitionResolver.getPackageDefinition(hash))

                await this.writeExtractionHash(hash)
            } catch (err) {
                logger.error(err)
            }
            spin.succeed(`Extracted ${this.package.fullName}`)
        }
    }

    public async ensureSourceHash(hash: string) {
        if (await hasHash(this.getRepositoryPath(), hash)) {
            return true
        } else {
            throw new Error(`Repository '${this.package.fullName}' does not contain hash '${hash}'`)
        }
        return false
    }

    public async mayPull() {
        return (
            update() ||
            (!(await fs.pathExists(this.getCachePath()!)) &&
                (headless() || askPull(this.package.name)))
        )
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
