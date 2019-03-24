import { isFunction } from 'lodash'
import { FsApi } from '~/api/fs'
import { GitApi } from '~/api/git'
import { PackageApi } from '~/api/package'
import { executeSandboxTypescript } from '~/sandbox/sandbox'
import { isGitLock } from './lock'
import { PackageBuilder } from './packageBuilder'

interface ExtractionApi {
    pkg: PackageApi
    git: GitApi
    fs: FsApi
}

export class Extractor extends PackageBuilder {
    public async run() {
        const extraction: ExtractionApi = {
            pkg: {
                settings: this.builder.lock.settings,
            },
            git: new GitApi(this.builder.package.source.getRepositoryPath(), spin),
            fs: new FsApi(),
        }
        if (isGitLock(this.builder.lock)) {
            extraction.pkg.hash = this.builder.lock.hash
        }

        console.log(this.builder.package.source.getRepositoryPath())
        const script = await executeSandboxTypescript(
            'C:/Users/Paul/Nextcloud/Documents/Repositories/ZPM/extractors/default/extract.ts',
            extraction
        )
        if (script) {
            if (isGitLock(this.builder.lock) && isFunction(script.checkout)) {
                await script.checkout()
            }
            if (isFunction(script.extract)) {
                await script.extract()
            }
        }
    }
}
