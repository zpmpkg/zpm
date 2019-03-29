import { cloneDeep, forEach, get, isArray, isEmpty, omit } from 'lodash'
import { isDefined } from '~/common/util'
import { Registries } from '~/registry/registries'
import { isGitPackageEntry, isPathPackageEntry } from '~/solver/package'
import { PackageDefinition, PackageGitEntry, PackagePathEntry } from '~/types/package.v1'
import { PackageOptions } from '../../registry/package'

interface PackagePathDefinitionEntry extends PackagePathEntry {
    isBuildDefinition: boolean
}
interface PackageGitDefinitionEntry extends PackageGitEntry {
    isBuildDefinition: boolean
}

export interface PackageDefinitionSummary {
    packages: {
        path: { [k: string]: PackagePathDefinitionEntry[] }
        named: { [k: string]: PackageGitDefinitionEntry[] }
    }
    description: PackageDescription
}

export interface PackageDescription {
    [k: string]: any
}

export function fromPackageDefinition(
    pkg: PackageDefinition,
    options: PackageOptions,
    registries: Registries,
    pkgType: string
): PackageDefinitionSummary {
    const types = registries.getTypes()
    const definition: PackageDefinitionSummary = {
        packages: {
            path: {},
            named: {},
        },
        description: omit(pkg, ['requires', 'development']),
    }

    forEach(types, type => {
        const manifest = registries.getManifest(type)
        let values = get(pkg, ['requires', type], [])
        if (!isArray(values)) {
            if (manifest.options.isBuildDefinition) {
                values = [values]
            } else {
                // todo throw
            }
        }
        if (options.isRoot) {
            const development = get(pkg, ['development', type], [])
            values.push(...(!isArray(development) ? [development] : development))
        }
        if (isEmpty(values) && isDefined((manifest.options.defaults || {})[pkgType])) {
            const defaultUsage = cloneDeep(manifest.options.defaults![pkgType])
            if (manifest.options.settingsPath && pkg[manifest.options.settingsPath]) {
                // @todo correct merging of settings
                defaultUsage.settings = {
                    ...defaultUsage.settings,
                    ...pkg[manifest.options.settingsPath],
                }
            }
            values.push(defaultUsage)
        }
        forEach(values, entry => {
            if (isPathPackageEntry(entry)) {
                if (!isDefined(definition.packages.path[type])) {
                    definition.packages.path[type] = []
                }

                definition.packages.path[type].push({
                    name: entry.name,
                    path: entry.path,
                    version: entry.version,
                    settings: entry.settings || {},
                    isBuildDefinition: manifest.options.isBuildDefinition!,
                })
            } else if (isGitPackageEntry(entry)) {
                if (!isDefined(definition.packages.named[type])) {
                    definition.packages.named[type] = []
                }
                console.log(entry, '$$$$$$$$$$$$$$$')
                definition.packages.named[type].push({
                    name: entry.name,
                    version: entry.version,
                    definition: entry.definition,
                    settings: entry.settings || {},
                    isBuildDefinition: manifest.options.isBuildDefinition!,
                })
            }
        })
    })

    return definition
}
