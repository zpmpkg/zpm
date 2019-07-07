import fs from 'fs-extra'
import { isEmpty } from 'lodash'
import { join } from 'upath'
import { Spinner } from '~/cli/spinner'
import { copy } from '~/common/io'

export class FsApi {
    public source: string
    public target: string
    public spinner?: Spinner
    public constructor(source: string, target: string, spinner?: Spinner) {
        this.source = source
        this.target = target
        this.spinner = spinner
    }
    public async copy(sources: string[], options?: { excludes?: string[] }): Promise<void> {
        if (!isEmpty(sources)) {
            await copy(sources, this.source, this.target)
        }
    }

    public exists(file: string, where: 'source' | 'target') {
        return fs.pathExistsSync(join(where === 'source' ? this.source : this.target, file))
    }
}
