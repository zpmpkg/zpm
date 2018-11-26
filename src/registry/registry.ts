import { exists } from 'async-file'
import gitUrlParse from 'git-url-parse'
import { join } from 'upath'
import { update } from '~/cli/program'
import { environment } from '~/common/environment'
import { cloneOrFetch } from '~/common/git'
import { logger } from '~/common/logger'
import { shortHash } from '~/common/util'

export class Registry {
    public url: string
    public branch?: string
    public valid: boolean = true
    public directory: string
    public isLocal: boolean = false
    constructor(url: string, branch?: string) {
        this.url = url
        this.branch = branch
    }

    public async pull() {
        if (gitUrlParse(this.url).protocol === 'file') {
            if (await exists(this.url)) {
                this.directory = this.url
                logger.info(`Hit: ${this.url}`)
            } else {
                logger.error(`We do not support file protocol for registry: ${this.url}`)
                this.valid = false
            }
        } else {
            this.directory = join(environment.directory.registries, shortHash(this.url))
            if (this.mayPull()) {
                const fetched = await cloneOrFetch(this.directory, this.url, this.branch)
                logger.info(`Hit: ${this.url} ${fetched ? `(${fetched.latest})` : ''}`)
            }
        }
    }

    private mayPull() {
        return update()
    }
}
