import { isDefined } from '@zefiros/axioms'
import fs from 'fs-extra'
import { find, has, isArray } from 'lodash'
import { join } from 'upath'
import { loadJsonOrYaml } from '~/common/io'
import { VersionRange } from '~/common/range'
import { validateSchema } from '~/common/validation'
import { IPackage, PackageVersion } from '~/package/internal'
import {
    PackageDefinition,
    PackageFileDefinition,
    PackageSchema,
    PackageSchemas,
} from '~/types/package.v1'
import { Await } from '~common/util'
import { Version } from '~common/version'
import { fromPackageDefinition, PackageDefinitionSummary } from './definition'
import { packageValiator } from './validator'

export async function getPathPackageDefinition(
    pkg: IPackage,
    parent: PackageVersion,
    options: { subpath?: string; version?: Version } = {}
): Promise<PackageDefinitionSummary> {
    const info = pkg.info
    let content: Await<ReturnType<typeof getPathContent>> = {
        content: undefined,
    }
    try {
        content = await getPathContent(
            info.directories.definition,
            options.version,
            options.subpath
        )
    } catch (e) {
        //
        // @todo
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
        pkg.package.manifest.type,
        parent
    )
}

export async function getPathContent(
    directory: string,
    version?: Version,
    subpath?: string
): Promise<{ content: PackageFileDefinition | undefined; path?: string }> {
    for (const prefix of ['.', '']) {
        const json = join(...[directory, subpath, `${prefix}zpm.json`].filter(isDefined))
        const yml = join(...[directory, subpath, `${prefix}zpm.yml`].filter(isDefined))
        let pth: string = directory
        let content: PackageDefinition | undefined
        if (await fs.pathExists(json)) {
            content = (await loadFile(json)) as PackageDefinition
            pth = json
        } else if (await fs.pathExists(yml)) {
            content = getYamlDefinition((await loadFile(yml)) as PackageSchema, version)
            pth = yml
        }
        return { content, path: pth }
    }
    return { content: undefined, path: directory }
}

export function getYamlDefinition(
    yml: PackageSchema,
    version?: Version
): PackageFileDefinition | undefined {
    if (isArray(yml)) {
        if (isSingularYaml(yml) || !isDefined(version)) {
            return yml[0]
        }
        const found = find(yml, (y: PackageSchema) => {
            if (isPackageSchemas(y)) {
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
): Promise<PackageSchema[] | PackageFileDefinition | undefined> {
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

export function getDefinition(yml: PackageSchema): PackageFileDefinition {
    if (isPackageSchemas(yml)) {
        return yml.definition
    }
    return yml
}

export function isPackageSchemas(arg: PackageSchema): arg is PackageSchemas {
    return has(arg, ['versions'])
}
