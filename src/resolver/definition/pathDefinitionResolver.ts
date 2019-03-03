import * as fs from 'fs-extra'
import { find, has, isArray } from 'lodash'
import { join } from 'upath'
import { transformPath } from '~/common/io'
import { logger } from '~/common/logger'
import { VersionRange } from '~/common/range'
import { isDefined } from '~/common/util'
import { buildSchema, validateSchema } from '~/common/validation'
import { packageV1 } from '~/schemas/schemas'
// tslint:disable-next-line:ordered-imports
import { PackageDefinition, PackageSchema } from '~/types/package.v1'
import { DefinitionResolver } from './definitionResolver'
import { fromPackageDefinition, PackageDefinitionSummary } from './packageDefinition'

export class PathDefinitionResolver extends DefinitionResolver {
    private validator = buildSchema(packageV1)
    public async getPackageDefinition(version?: string): Promise<PackageDefinitionSummary> {
        const directory = this.getDefinitionPath()

        let content: { content: PackageDefinition | undefined; path?: string } = {
            content: undefined,
        }
        try {
            content = await this.getContent(directory, version)
        } catch (e) {
            //
        }
        content.content = validateSchema(content.content || {}, undefined, {
            throw: true,
            origin: `package '${this.source.package.fullName}' definition on path '${
                content.path
            }'`,
            validator: this.validator,
        })
        if (this.source.package.manifest.packageValidator) {
            content.content = validateSchema(content.content || {}, undefined, {
                throw: true,
                origin: `package '${this.source.package.fullName}' definition on path '${
                    content.path
                }'`,
                validator: this.source.package.manifest.packageValidator,
            })
        }
        if (!isDefined(content.content)) {
            throw new Error(`Could not find a matching schema for version '${version}'`)
        }
        return fromPackageDefinition(content.content, this.source.package.options)
    }

    public getDefinitionPath() {
        return this.source.getDefinitionPath()
    }

    public mayUseDevelopmentPackages(): boolean {
        return this.source.package.options.isRoot === undefined
            ? false
            : this.source.package.options.isRoot
    }

    private async getContent(
        directory: string,
        version?: string
    ): Promise<{ content: PackageDefinition | undefined; path?: string }> {
        logger.logfile.info(`Trying to read '${this.source.package.fullName}' from '${directory}`)
        for (const prefix of ['.', '']) {
            const json = transformPath(join(directory, `${prefix}package.json`))
            const yml = transformPath(join(directory, `${prefix}package.yml`))
            let pth: string = directory
            let content: PackageDefinition | undefined
            if (await fs.pathExists(json)) {
                content = (await this.loadFile(json)) as PackageDefinition
                pth = json
            } else if (await fs.pathExists(yml)) {
                content = this.getYamlDefinition(
                    (await this.loadFile(yml)) as PackageSchema[],
                    version
                )
                pth = yml
            }
            return { content, path: pth }
        }
        return { content: undefined, path: directory }
    }

    private getYamlDefinition(
        yml: PackageSchema[],
        version?: string
    ): PackageDefinition | undefined {
        if (isArray(yml)) {
            if (this.isSingularYaml(yml)) {
                return yml[0]
            }
            const found = find(yml, (y: PackageSchema) => {
                if (isDefined(y.versions)) {
                    return new VersionRange(y.versions).satisfies(version!)
                }
                return false
            })
            if (!found) {
                return undefined
            }
            return this.getDefinition(found)
        }
        return this.getDefinition(yml)
    }

    private isSingularYaml(yml: PackageSchema[]): yml is PackageDefinitionSummary[] {
        if (yml.length === 1) {
            return !(has(yml[0], 'versions') && has(yml[0], 'definition'))
        }
        return false
    }

    private getDefinition(yml: PackageSchema): PackageDefinitionSummary {
        if (isDefined(yml.versions)) {
            return yml.definition
        }
        return yml as PackageDefinitionSummary
    }
}
