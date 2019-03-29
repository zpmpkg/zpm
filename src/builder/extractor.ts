import * as fs from 'fs-extra'
import { get, isFunction } from 'lodash'
import { join } from 'upath'
import { FsApi } from '~/api/fs'
import { GitApi } from '~/api/git'
import { PackageApi } from '~/api/package'
import { force } from '~/cli/program'
import { spinners } from '~/cli/spinner'
import { environment } from '~/common/environment'
import { hasHash } from '~/common/git'
import { logger } from '~/common/logger'
import { executeSandboxTypescript } from '~/sandbox/sandbox'
import { isGitLock } from './lock'
import { BasePackageBuilder, PackageBuilder, PackageType } from './packageBuilder'

interface ExtractionApi {
    pkg: PackageApi
    git: GitApi
    fs: FsApi
}

export class Extractor extends PackageBuilder {
    public async run(target: BasePackageBuilder): Promise<boolean> {
        const hash = target.getHash()
        if (await this.needsExtraction(target)) {
            const spin = spinners.create(`Extracting '${target.package.fullName}@${hash}':`)
            try {
                await fs.remove(target.getTargetPath())
                await fs.ensureDir(target.getTargetPath())
                if (await this.ensureSourceHash(target)) {
                    const extraction: ExtractionApi = {
                        pkg: {
                            settings: target.lock.settings,
                            description: target.lock.description,
                            usage: get(this.lock.usage, ['settings', target.lock.id]) || {},
                            globals: this.lock.description,
                        },
                        git: new GitApi(target.package.source.getRepositoryPath(), spin),
                        fs: new FsApi(
                            target.package.source.getRepositoryPath(),
                            target.getTargetPath(),
                            spin
                        ),
                    }
                    if (isGitLock(target.lock)) {
                        extraction.pkg.hash = target.lock.hash
                    }
                    const filepath = join(this.package.source.getRepositoryPath(), 'extract.ts')
                    const script = await executeSandboxTypescript(filepath, extraction)
                    if (script) {
                        if (
                            isGitLock(target.lock) &&
                            isFunction(script.checkout) &&
                            target.options.type === PackageType.NAMED
                        ) {
                            await script.checkout()
                        }
                        if (isFunction(script.extract)) {
                            await script.extract()
                        }
                    }
                } else {
                    logger.error(
                        `Failed to find hash '${hash}' on package '${target.package.fullName}'`
                    )
                }

                await this.writeExtractionHash(target)
            } catch (err) {
                logger.error(err)
            }
            spin.succeed(`Extracted '${target.package.fullName}'`)
        }
        return true
    }

    public async needsExtraction(target: BasePackageBuilder) {
        const hash = target.getHash()
        const file = this.getExtractionHashPath(target)
        if (!force() && (await fs.pathExists(file)) && hash) {
            return (await fs.readFile(file)).toString() !== hash
        }
        return true
    }

    public async writeExtractionHash(target: BasePackageBuilder) {
        const hash = target.getHash()
        if (hash) {
            await fs.writeFile(this.getExtractionHashPath(target), hash)
        }
    }

    public getExtractionHashPath(target: BasePackageBuilder): string {
        return join(
            environment.directory.extract,
            target.package.manifest.type,
            target.package.vendor,
            target.package.name,
            '.EXTRACTION_HASH'
        )
    }

    public async ensureSourceHash(target: BasePackageBuilder) {
        const hash = target.getHash()
        if (hash) {
            if (await hasHash(target.package.source.getRepositoryPath(), hash)) {
                return true
            } else {
                throw new Error(
                    `Repository '${target.package.fullName}' does not contain hash '${hash}'`
                )
            }
        }
        return true
    }
}
