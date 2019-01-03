import * as fs from 'fs-extra'
import gitUrlParse from 'git-url-parse'
import { join } from 'upath'
import { askRegistry } from '~/cli/inquiries'
import { headless, update } from '~/cli/program'
import { spinners } from '~/cli/spinner'
import { environment } from '~/common/environment'
import { cloneOrPull, CloneOrPullResult } from '~/common/git'
import { shortHash } from '~/common/util'
import { RegistryDefinition } from '~/types/definitions.v1'

export class Registry {
    public url: string
    public branch?: string
    public valid: boolean = true
    public directory: string | undefined
    public isLocal: boolean = false
    public isUpdated: boolean = false
    constructor(url: string, branch?: string) {
        this.url = url
        this.branch = branch
    }

    public async update(): Promise<RegistryDefinition[] | undefined> {
        if (this.isUpdated) {
            return undefined
        }

        if (gitUrlParse(this.url).protocol === 'file') {
            const spin = spinners.create(`Loading registry ${this.url}`)
            if (await fs.pathExists(this.url)) {
                this.directory = this.url
                spin.succeed(`Loaded registry '${this.url}'`)
            } else {
                spin.fail(`We do not support file protocol for registry: ${this.url}`)
                this.valid = false
            }
        } else {
            this.directory = join(environment.directory.registries, shortHash(this.url))
            if (await this.mayPull()) {
                const spin = spinners.create(`Pulling registry ${this.url}`)
                const fetched = await cloneOrPull(this.directory, this.url, {
                    branch: this.branch,
                    stream: spin.stream,
                })
                spin.succeed(`Pulled registry '${this.url}' ${this.getHitInfo(fetched)}`)
            }
        }
        this.isUpdated = true

        return []
    }

    private async mayPull() {
        return (
            update() ||
            (!(await fs.pathExists(this.directory!)) && (headless() || askRegistry(this.url)))
        )
    }

    private getHitInfo(fetched: CloneOrPullResult): string {
        if (!fetched.cloned) {
            if (fetched.newCommits) {
                return `(${fetched.newCommits})`
            }
            return '(no changes)'
        }
        return '(cloned)'
    }
}
