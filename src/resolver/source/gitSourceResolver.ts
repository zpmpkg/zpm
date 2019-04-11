import * as fs from 'fs-extra'
import isGitUrl from 'is-git-url'
import { join, normalizeSafe } from 'upath'
import { headless, update } from '~/cli/program'
import { spinners } from '~/cli/spinner'
import { settledPromiseAll } from '~/common/async'
import { environment } from '~/common/environment'
import {
    cloneOrFetch,
    CloneOrFetchResult,
    cloneOrPull,
    CloneOrPullResult,
    showRef,
} from '~/common/git'
// import { copy } from '~/common/io'
import { isDefined } from '~/common/util'
import { Version } from '~/common/version'
import { SourceResolver } from '~/resolver/source/sourceResolver'
import { GitDefinitionResolver } from '../definition/gitDefinitionResolver'
import { PathDefinitionResolver } from '../definition/pathDefinitionResolver'
import { isNamedEntry } from './factory'

export class GitSourceResolver extends SourceResolver {
    public loaded = false
    public gitDefinition = true
    public async load(): Promise<boolean> {
        if (this.loaded) {
            return true
        }
        this.loaded = true

        if (this.isDefinitionSeparate()) {
            this.definitionResolver = new PathDefinitionResolver(this)
            this.gitDefinition = isGitUrl(this.definition!)
        } else {
            this.definitionResolver = new GitDefinitionResolver(this)
        }

        if (await this.mayPull()) {
            await settledPromiseAll([
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
                    if (this.gitDefinition) {
                        const spin = spinners.create(
                            `Pulling definition '${this.package.fullName}'`
                        )
                        const result = await cloneOrPull(
                            this.getDefinitionPath(),
                            this.definition!,
                            {
                                stream: spin.stream,
                            }
                        )
                        spin.succeed(
                            `Pulled definition '${this.package.fullName}' ${this.getPullInfo(
                                result
                            )}`
                        )
                    }
                })(),
            ])
        }
        return this.loaded
    }
    public getName(): string {
        return 'GIT'
    }

    public getDefinitionPath(): string {
        if (this.gitDefinition) {
            return join(this.getCachePath(), 'definition')
        }
        let path = this.definition!

        if (isDefined(this.package.options.absolutePath)) {
            path = join(this.package.options.absolutePath, path)
        }
        if (this.package.options.root) {
            return normalizeSafe(join(this.package.options.root.source.getDefinitionPath(), path))
        }
        return path
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

        const output = await showRef(this.getRepositoryPath())
        const versions = output
            .split('\n')
            .map(s => s.split(' '))
            .filter(s => s.length === 2)
            .map(s => {
                let result
                try {
                    if (s[1].includes('/tags/')) {
                        result = {
                            version: new Version(s[1].replace('refs/tags/', '')),
                            hash: s[0],
                            name: s[1].replace('refs/tags/', ''),
                        }
                    } else if (s[1].includes('/remotes/')) {
                        result = {
                            version: new Version(s[1].replace('refs/remotes/origin/', '')),
                            hash: s[0],
                            name: s[1].replace('refs/remotes/origin/', ''),
                        }
                    }
                } catch (error) {
                    result = undefined
                }
                return result
            })
            .filter(isDefined)
            .sort((a, b) => b.version.cost - a.version.cost)
            .reverse()
        return versions
    }

    public async getTags() {
        const output = await showRef(this.getRepositoryPath())
        return output
            .split('\n')
            .map(s => s.split(' '))
            .filter(s => s.length === 2)
            .map(s => {
                let result
                try {
                    result = {
                        version: new Version(s[1].replace('refs/remotes/origin/', '')),
                        hash: s[0],
                        name: s[1].replace('refs/remotes/origin/', ''),
                    }
                } catch (error) {
                    result = undefined
                }
                return result
            })
            .filter(isDefined)
    }

    public getPath(): string {
        if (isNamedEntry(this.package.entry)) {
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

    public async mayPull() {
        return update() || headless() || !(await fs.pathExists(this.getCachePath()))
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
