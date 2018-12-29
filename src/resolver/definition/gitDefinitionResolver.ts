import { safeLoad } from 'js-yaml'
import { catFile } from '~/common/git'
import { isDefined } from '~/common/util'
import { validateSchema } from '~/common/validation'
import { packageV1 } from '~/schemas/schemas'
import { DefinitionResolver } from './definitionResolver'
import { fromPackageDefinition, PackageDefinitionSummary } from './packageDefinition'

export class GitDefinitionResolver extends DefinitionResolver {
    public async getPackageDefinition(hash?: string): Promise<PackageDefinitionSummary> {
        const directory = this.getDefinitionPath()

        let content: { content: PackageDefinitionSummary | undefined; path?: string } = {
            content: undefined,
        }
        try {
            content = await this.getContent(directory, hash!)
        } catch (e) {
            //
        }

        content.content = validateSchema(content.content || {}, packageV1, {
            throw: true,
            origin: `package '${this.source.package.fullName}' definition on version '${hash}'`,
        })
        if (!isDefined(content.content)) {
            throw new Error(`Could not find a matching schema for version '${hash}'`)
        }

        return fromPackageDefinition(content.content, this.source.package.options)
    }

    public getDefinitionPath() {
        return this.source.getDefinitionPath()
    }

    private async getContent(
        directory: string,
        hash: string
    ): Promise<{ content: PackageDefinitionSummary | undefined; path?: string }> {
        for (const prefix of ['.', '']) {
            for (const file of [`${prefix}package.json`, `${prefix}package.yml`]) {
                const fileContents = await catFile(directory, ['-p', `${hash}:${file}`])
                if (isDefined(fileContents)) {
                    const content: PackageDefinitionSummary | undefined = safeLoad(fileContents)
                    return { content, path: file }
                }
            }
        }
        return { content: undefined }
    }
}
