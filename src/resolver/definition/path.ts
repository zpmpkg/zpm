import { isDefined } from '@zefiros/axioms/is-defined'
import fs from 'fs-extra'
import { find, has, isArray } from 'lodash'
import { join } from 'upath'
import { loadJsonOrYaml } from '~/common/io'
import { VersionRange } from '~/common/range'
import { buildSchema, validateSchema } from '~/common/validation'
import { IPackage } from '~/package/package'
import { packageV1 } from '~/schemas/schemas'
import { PackageDefinition, PackageSchema } from '~/types/package.v1'
import { fromPackageDefinition, PackageDefinitionSummary } from './packageDefinition'

const packageValiator = buildSchema(packageV1)

export async function getPathPackageDefinition(pkg: IPackage): Promise<PackageDefinitionSummary> {
    const info = pkg.info
    let content: { content: PackageDefinition | undefined; path?: string } = {
        content: undefined,
    }
    try {
        content = await getContent(info.directories.definition)
    } catch (e) {
        //
    }
    content.content = validateSchema(content.content || {}, undefined, {
        throw: true,
        origin: `package '${info.name}' definition on path '${content.path}'`,
        validator: packageValiator,
    })
    if (pkg.package.manifest.packageValidator) {
        content.content = validateSchema(content.content || {}, undefined, {
            throw: true,
            origin: `package '${info.name}' definition on path '${content.path}'`,
            validator: pkg.package.manifest.packageValidator,
        })
    }
    if (!isDefined(content.content)) {
        throw new Error(`Could not find a matching schema`)
    }
    return fromPackageDefinition(
        content.content,
        pkg.info,
        pkg.package.manifest.registries,
        pkg.package.manifest.type
    )
}

export async function getContent(
    directory: string,
    version?: string
): Promise<{ content: PackageDefinition | undefined; path?: string }> {
    for (const prefix of ['.', '']) {
        const json = join(directory, `${prefix}zpm.json`)
        const yml = join(directory, `${prefix}zpm.yml`)
        let pth: string = directory
        let content: PackageDefinition | undefined
        if (await fs.pathExists(json)) {
            content = (await loadFile(json)) as PackageDefinition
            pth = json
        } else if (await fs.pathExists(yml)) {
            content = getYamlDefinition((await loadFile(yml)) as PackageSchema[], version)
            pth = yml
        }
        return { content, path: pth }
    }
    return { content: undefined, path: directory }
}

export function getYamlDefinition(
    yml: PackageSchema[],
    version?: string
): PackageDefinition | undefined {
    if (isArray(yml)) {
        if (isSingularYaml(yml) || !isDefined(version)) {
            return yml[0]
        }
        const found = find(yml, (y: PackageSchema) => {
            if (isDefined(y.versions)) {
                return new VersionRange(y.versions).satisfies(version)
            }
            return false
        })
        if (!found) {
            return undefined
        }
        return getDefinition(found)
    }
    return getDefinition(yml)
}

export async function loadFile(
    file: string
): Promise<PackageSchema[] | PackageDefinition | undefined> {
    let content
    if (await fs.pathExists(file)) {
        content = await loadJsonOrYaml(file)
    }
    return content
}

export function isSingularYaml(yml: PackageSchema[]): yml is PackageDefinitionSummary[] {
    if (yml.length === 1) {
        return !(has(yml[0], 'versions') && has(yml[0], 'definition'))
    }
    return false
}

export function getDefinition(yml: PackageSchema): PackageDefinitionSummary {
    if (isDefined(yml.versions)) {
        return yml.definition
    }
    return yml as PackageDefinitionSummary
}
