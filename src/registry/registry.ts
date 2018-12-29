import * as fs from 'fs-extra'
import gitUrlParse from 'git-url-parse'
import ora from 'ora'
import { join } from 'upath'
import { update } from '~/cli/program'
import { environment } from '~/common/environment'
import { cloneOrPull, CloneOrPullResult } from '~/common/git'
import { logger } from '~/common/logger'
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
            if (await fs.pathExists(this.url)) {
                const spinner = ora(`Pulling registry ${this.url}`).start()
                this.directory = this.url
                spinner.succeed(`Pulled registry '${this.url}'`)
            } else {
                logger.error(`We do not support file protocol for registry: ${this.url}`)
                this.valid = false
            }
        } else {
            this.directory = join(environment.directory.registries, shortHash(this.url))
            if (this.mayPull()) {
                const spinner = ora(`Pulling registry ${this.url}`).start()
                const fetched = await cloneOrPull(this.directory, this.url, this.branch)
                spinner.succeed(`Pulled registry '${this.url}' ${this.getHitInfo(fetched)}`)
            }
        }
        this.isUpdated = true

        return []
    }

    private mayPull() {
        return update()
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
