import { isDefined } from '@zefiros/axioms'
import { safeLoad } from 'js-yaml'
import { catFile } from '~/common/git'
import { validateSchema } from '~/common/validation'
import { IPackage, PackageVersion } from '~/package/internal'
import { PackageDefinition } from '~/types/package.v1'
import { GitVersion } from '../source/git'
import { fromPackageDefinition, PackageDefinitionSummary } from './definition'
import { packageValiator } from './validator'

export async function getGitPackageDefinition(
    pkg: IPackage,
    gitVersion: GitVersion,
    parent: PackageVersion
): Promise<PackageDefinitionSummary> {
    const info = pkg.info
    let content: { content: PackageDefinition | undefined; path?: string } = {
        content: undefined,
    }
    try {
        content = await getGitContent(info.directories.definition, gitVersion)
    } catch (e) {
        //
        // @todo
    }
    content.content = validateSchema(content.content || {}, undefined, {
        throw: true,
        origin: `package '${info.name}' definition on version '${gitVersion.name}'`,
        validator: packageValiator,
    })
    if (pkg.package.manifest.packageValidator) {
        content.content = validateSchema(content.content || {}, undefined, {
            throw: true,
            origin: `package '${info.name}' definition on version '${gitVersion.name}'`,
            validator: pkg.package.manifest.packageValidator,
        })
    }
    if (!isDefined(content.content)) {
        throw new Error(`Could not find a matching schema for version '${gitVersion.name}'`)
    }
    return fromPackageDefinition(
        content.content,
        pkg.info,
        pkg.package.manifest.registries,
        pkg.package.manifest.type,
        parent
    )
}

export async function getGitContent(
    directory: string,
    gitVersion: GitVersion
): Promise<{ content: PackageDefinition | undefined; path?: string }> {
    for (const prefix of ['.', '']) {
        for (const file of [`${prefix}zpm.json`, `${prefix}zpm.yml`]) {
            const fileContents = await catFile(directory, ['-p', `${gitVersion.hash}:${file}`])
            if (isDefined(fileContents)) {
                const content: PackageDefinition | undefined = safeLoad(fileContents)
                return { content, path: file }
            }
        }
    }
    return { content: undefined }
}
