import * as fs from 'fs-extra'
import gitUrlParse from 'git-url-parse'
import { join } from 'upath'
import { askRegistry } from '~/cli/inquiries'
import { headless, update } from '~/cli/program'
import { spinners } from '~/cli/spinner'
import { environment } from '~/common/environment'
import { cloneOrPull, CloneOrPullResult } from '~/common/git'
import { logger } from '~/common/logger'
import { shortHash } from '~/common/util'
import { RegistryDefinition } from '~/types/definitions.v1'
import { transformPath } from '~/common/io'

export class Registry {
    public urlOrPath: string
    public branch?: string
    public valid: boolean = true
    public directory: string | undefined
    public workingDirectory: string | undefined
    public isLocal: boolean = false
    public isUpdated: boolean = false
    public name?: string
    constructor(
        urlOrPath: string,
        options?: { branch?: string; name?: string; workingDirectory?: string }
    ) {
        const { branch, name, workingDirectory } = options || {
            branch: undefined,
            name: undefined,
            workingDirectory: undefined,
        }
        this.urlOrPath = transformPath(urlOrPath)
        this.workingDirectory = workingDirectory ? transformPath(workingDirectory) : undefined
        this.branch = branch
        this.name = name
    }

    public async update(): Promise<RegistryDefinition[] | undefined> {
        if (this.isUpdated) {
            return undefined
        }
        if (gitUrlParse(this.urlOrPath).protocol === 'file') {
            if (await fs.pathExists(this.urlOrPath)) {
                this.directory = this.urlOrPath
            } else {
                logger.error(`We do not support file protocol for registry: ${this.urlOrPath}`)
                this.valid = false
            }
        } else {
            this.directory = join(environment.directory.registries, shortHash(this.urlOrPath))
            if (await this.mayPull()) {
                const spin = spinners.create({
                    text: `Pulling registry ${this.urlOrPath}`,
                })
                const fetched = await cloneOrPull(this.directory, this.urlOrPath, {
                    branch: this.branch,
                    stream: spin.stream,
                })
                spin.succeed(`Pulled registry '${this.urlOrPath}' ${this.getHitInfo(fetched)}`)
            }
        }
        this.isUpdated = true

        return []
    }

    private async mayPull() {
        return (
            update() ||
            (!(await fs.pathExists(this.directory!)) && (headless() || askRegistry(this.urlOrPath)))
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
