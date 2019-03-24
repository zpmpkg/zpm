import * as fs from 'fs-extra'
import { join } from 'upath'
import { force } from '~/cli/program'
import { spinners } from '~/cli/spinner'
import { environment } from '~/common/environment'
import { hasHash } from '~/common/git'
import { logger } from '~/common/logger'
import { Package } from '~/registry/package'
import { GitLock, PathLock } from '~/types/lockfile.v1'
import { isGitLock } from './lock'
import { Builder } from './builder'

export const enum PackageType {
    GIT,
    ROOT,
    PATH,
}

export interface BuilderOptions {
    type: PackageType
}

export class PackageBuilder {
    public lock: GitLock | PathLock
    public package: Package
    public extraction = {}

    public build = {}

    public settings: { [k: string]: any } = {}

    public options: BuilderOptions
    public builder: Builder

    public constructor(
        builder: Builder,
        pkg: Package,
        lock: GitLock | PathLock,
        options: Partial<BuilderOptions> = {}
    ) {
        this.builder = builder
        this.package = pkg
        this.lock = lock
        this.options = {
            type: PackageType.PATH,
            ...options,
        }
    }

    public async extract(): Promise<boolean> {
        const hash = this.getHash()
        if (await this.needsExtraction()) {
            const spin = spinners.create(`Extracting '${this.package.fullName}@${hash}':`)
            try {
                await fs.remove(this.getExtractionPath())
                await fs.ensureDir(this.getExtractionPath())
                if (await this.ensureSourceHash()) {
                    // await checkout(this.getRepositoryPath(), this.hash, { spinner: spin })
                    // await copy(
                    //     //     (await this.definitionResolver.getPackageDefinition(hash)).includes,
                    //     [
                    //         '**/*.h',
                    //         '**/*.cpp',
                    //         '**/*.cc',
                    //         '**/*.cxx',
                    //         '**/*.c',
                    //         '**/*.s',
                    //         '**/*.m',
                    //         '**/*.mm',
                    //     ],
                    //     this.getRepositoryPath(),
                    //     this.getExtractionPath()
                    // )
                } else {
                    logger.error(
                        `Failed to find hash '${hash}' on package '${this.package.fullName}'`
                    )
                }

                // console.log(await this.definitionResolver.getPackageDefinition(hash))

                await this.writeExtractionHash()
            } catch (err) {
                logger.error(err)
            }
            spin.succeed(`Extracted '${this.package.fullName}'`)
        }
        return true
    }

    public getExtractionPath(): string {
        return join(
            environment.directory.extract,
            this.package.manifest.type,
            this.package.vendor,
            this.package.name
        )
    }

    public async needsExtraction() {
        // if (!this.options.needsExtraction) {
        //     return false
        // }

        const hash = this.getHash()
        const file = this.getExtractionHashPath()
        if (!force() && (await fs.pathExists(file)) && hash) {
            return (await fs.readFile(file)).toString() !== hash
        }
        return true
    }

    public getHash() {
        return isGitLock(this.lock) ? this.lock.hash : undefined
    }

    public async writeExtractionHash() {
        const hash = this.getHash()
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

    public async ensureSourceHash() {
        const hash = this.getHash()
        if (hash) {
            if (await hasHash(this.package.source.getRepositoryPath(), hash)) {
                return true
            } else {
                throw new Error(
                    `Repository '${this.package.fullName}' does not contain hash '${hash}'`
                )
            }
        }
        return true
    }
}
