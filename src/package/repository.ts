import { Mutex } from 'async-mutex'
import { Spinner, spinners } from '~/cli/spinner'
import {
    checkout,
    cloneOrFetch,
    CloneOrFetchResult,
    cloneOrPull,
    CloneOrPullResult,
} from '~/common/git'

export class Repository {
    public directory: string
    public url: string

    public loaded: boolean
    private mutex = new Mutex()

    public constructor(directory: string, url: string) {
        this.directory = directory
        this.url = url
        this.loaded = false
    }
    public async checkout(hash: string, spinner?: Spinner): Promise<void> {
        await this.mutex.runExclusive(async () => checkout(this.directory, hash, { spinner }))
    }

    public async cloneOrPull(what: string) {
        await this.mutex.runExclusive(async () => {
            if (!this.loaded) {
                this.loaded = true

                const spin = spinners.create({
                    text: `Pulling ${what}:`,
                })

                const result = await cloneOrPull(this.directory, this.url, {
                    stream: spin.stream,
                })
                spin.succeed(`Pulled ${what} ${this.getPullInfo(result)}`)
            }
        })
    }

    public async cloneOrFetch(what: string) {
        await this.mutex.runExclusive(async () => {
            if (!this.loaded) {
                this.loaded = true

                const spin = spinners.create({
                    text: `Pulling ${what}:`,
                })
                const result = await cloneOrFetch(this.directory, this.url, {
                    stream: spin.stream,
                })
                spin.succeed(`Fetched ${what} ${this.getFetchInfo(result)}`)
            }
        })
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

// tslint:disable-next-line: variable-name
const _repositories: Map<string, Repository> = new Map<string, Repository>()
export function createRepository(directory: string, url?: string) {
    if (!_repositories.has(directory)) {
        if (url) {
            _repositories.set(directory, new Repository(directory, url))
        } else {
            // @todo
        }
    }
    return _repositories.get(directory)!
}
