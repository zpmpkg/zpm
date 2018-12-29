import * as fs from 'fs-extra'
import { loadJsonOrYaml } from '~/common/io'
import { PackageSchema } from '~/types/package.v1'
import { SourceResolver } from '../source/sourceResolver'
import { PackageDefinitionSummary } from './packageDefinition'

export abstract class DefinitionResolver {
    public source: SourceResolver

    constructor(source: SourceResolver) {
        this.source = source
    }

    public abstract async getPackageDefinition(hash?: string): Promise<PackageDefinitionSummary>

    public getDefinitionPath() {
        return this.source.getDefinitionPath()
    }

    public async loadFile(
        file: string
    ): Promise<PackageSchema[] | PackageDefinitionSummary | undefined> {
        let content
        if (await fs.pathExists(file)) {
            content = await loadJsonOrYaml(file)
        }
        return content
    }
}
