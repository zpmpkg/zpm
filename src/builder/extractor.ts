import { get, isDefined } from '@zefiros/axioms'
import * as fs from 'fs-extra'
import { isFunction } from 'lodash'
import { join } from 'upath'
import { FsApi } from '~/api/fs'
import { GitApi } from '~/api/git'
import { PackageVersionApi } from '~/api/package'
import { PlatformApi } from '~/api/platform'
import { ShellApi } from '~/api/shell'
import { hasHash } from '~/common/git'
import { logger } from '~/common/logger'
import { executeSandboxTypescript } from '~/sandbox/sandbox'
import { PackageBuilder, TargetBuilder } from './packageBuilder'

interface ExtractionApi {
    version: PackageVersionApi
    git: GitApi
    fs: FsApi
    shell: ShellApi
    platform: PlatformApi
}

interface ExtractionStore {
    api: ExtractionApi
    script?: {
        checkout?: () => Promise<void>
        extract?: () => Promise<void>
    }
}

export class TargetExtractor extends TargetBuilder {
    public async prepare(target: PackageBuilder): Promise<boolean> {
        if (target.needsExtraction && target.targetPath) {
            // logger.debug(`Preparing ${this.version.id} on ${target.version.id}`)
            try {
                target.spin.update(`Cleaning '${target.version.id}':`)
                await fs.remove(target.targetPath)
                await fs.ensureDir(target.targetPath)

                const extraction = await this.buildExtraction(target)
                if (extraction.script) {
                    if (target.hash && isFunction(extraction.script.checkout)) {
                        target.spin.update(`Checking out '${target.version.id}':`)
                        await this.ensureSourceHash(target)
                        await extraction.script.checkout()
                    }
                }
            } catch (err) {
                logger.error(err)
                target.spin.fail(err)
            }
        }
        return true
    }

    public async run(target: PackageBuilder): Promise<boolean> {
        if (target.needsExtraction && target.targetPath) {
            const extraction = this.get<ExtractionStore>(target)
            try {
                if (extraction && extraction.script) {
                    if (isFunction(extraction.script.extract)) {
                        target.spin.update(`Extracting '${target.version.id}':`)
                        await extraction.script.extract()
                    }
                }
            } catch (err) {
                logger.error(err)
                target.spin.fail(err)
            }
        }
        return true
    }

    public async ensureSourceHash(target: PackageBuilder) {
        if (target.hash) {
            if (await hasHash(target.version.package.info.directories.source, target.hash)) {
                return true
            } else {
                throw new Error(
                    `Package '${target.version.id}' does not contain hash '${target.hash}'`
                )
            }
        }
        return true
    }

    public async buildExtraction(target: PackageBuilder): Promise<ExtractionStore> {
        if (!isDefined(target.targetPath)) {
            throw new Error()
            // @todo
        }
        const extraction: ExtractionApi = {
            version: {
                settings: target.versionLock.settings,
                definition: target.versionLock.definition,
                usage: get(
                    this.versionLock.usedBy.find(u => u.versionId === target.version.id),
                    ['settings'],
                    {}
                ),
                global: this.versionLock.definition,
                source: target.sourcePath,
                target: target.targetPath,
                hash: target.hash,
            },
            git: new GitApi(target.sourcePath, target.spin),
            fs: new FsApi(target.sourcePath, target.targetPath, target.spin),
            shell: new ShellApi(target.sourcePath, target.targetPath, target.spin),
            platform: new PlatformApi(),
        }
        const filepath = join(this.version.package.info.directories.definition, 'extract.ts')

        const store: ExtractionStore = {
            api: extraction,
            script: await executeSandboxTypescript(filepath, extraction),
        }

        this.store<ExtractionStore>(target, store)

        return store
    }
}
