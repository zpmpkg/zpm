import { safeLoad } from 'js-yaml'
import { catFile } from '~/common/git'
import { isDefined } from '~/common/util'
import { buildSchema, validateSchema } from '~/common/validation'
import { packageV1 } from '~/schemas/schemas'
import { PackageDefinition } from '~/types/package.v1'
import { DefinitionResolver } from './definitionResolver'
import { fromPackageDefinition, PackageDefinitionSummary } from './packageDefinition'

export class GitDefinitionResolver extends DefinitionResolver {
    private validator = buildSchema(packageV1)
    public async getPackageDefinition(hash?: string): Promise<PackageDefinitionSummary> {
        const directory = this.getDefinitionPath()

        let content: { content: PackageDefinition | undefined; path?: string } = {
            content: undefined,
        }
        try {
            content = await this.getContent(directory, hash!)
        } catch (e) {
            //logger.info(e)
            // @todo
        }

        content.content = validateSchema(content.content || {}, undefined, {
            throw: true,
            origin: `package '${this.source.package.fullName}' definition on version '${hash}'`,
            validator: this.validator,
        })
        if (this.source.package.manifest.packageValidator) {
            content.content = validateSchema(content.content || {}, undefined, {
                throw: true,
                origin: `package '${this.source.package.fullName}' definition on version '${hash}'`,
                validator: this.source.package.manifest.packageValidator,
            })
        }
        if (!isDefined(content.content)) {
            throw new Error(`Could not find a matching schema for version '${hash}'`)
        }

        return fromPackageDefinition(
            content.content,
            content.path!,
            this.source.package.options,
            this.source.package.manifest.registries,
            this.source.package.manifest.type
        )
    }

    public getDefinitionPath() {
        return this.source.getDefinitionPath()
    }

    private async getContent(
        directory: string,
        hash: string
    ): Promise<{ content: PackageDefinition | undefined; path?: string }> {
        for (const prefix of ['.', '']) {
            for (const file of [`${prefix}zpm.json`, `${prefix}zpm.yml`]) {
                const fileContents = await catFile(directory, ['-p', `${hash}:${file}`])
                if (isDefined(fileContents)) {
                    const content: PackageDefinition | undefined = safeLoad(fileContents)
                    return { content, path: file }
                }
            }
        }
        return { content: undefined }
    }
}
