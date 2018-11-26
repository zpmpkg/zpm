import { exists } from 'async-file'
import { join } from 'upath'
import { loadJsonOrYaml } from '~/common/io'
import { logger } from '~/common/logger'
import { validateSchema } from '~/common/validation'
import { packageV1 } from '~/schemas/schemas'
import { PackageSchema } from '~/types/package.v1'
import { SourceResolver } from '../source/sourceResolver'

export class DefinitionResolver {
    public source: SourceResolver

    constructor(source: SourceResolver) {
        this.source = source
    }

    public async getPackageDefinition(hash?: string): Promise<PackageSchema> {
        const directory = this.source.getDefinitionPath()
        return this.loadFile(join(directory, 'package.json'))
    }

    private async loadFile(file: string): Promise<PackageSchema> {
        let content
        if (await exists(file)) {
            content = await loadJsonOrYaml(file)
        }
        return validateSchema(content || {}, packageV1)
    }
}
