import { get, omit } from '@zefiros/axioms'
import { cloneDeep, findIndex, forEach, isArray, isEmpty } from 'lodash'
import { isDefined } from '~/common/util'
import { Registries } from '~/registry/registries'
import { isGitPackageEntry, isPathPackageEntry } from '~/solver/package'
import {
    PackageDefinition,
    PackageEntry,
    PackageGitEntry,
    PackagePathEntry,
} from '~/types/package.v1'
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
    definitionPath: string
}

export interface PackageDescription {
    [k: string]: any
}

export function fromPackageDefinition(
    pkg: PackageDefinition,
    definitionPath: string,
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
        description: omit(pkg, 'requires', 'development'),
        definitionPath,
    }

    forEach(types, type => {
        const manifest = registries.getManifest(type)
        const requiredValues = get(pkg, ['requires', type], [] as PackageEntry[])
        let values: PackageEntry[] = []
        if (!isArray(requiredValues)) {
            if (manifest.options.isBuildDefinition) {
                const defaultUsage = cloneDeep(manifest.options.defaults![pkgType])
                if (manifest.options.settingsPath && pkg[manifest.options.settingsPath]) {
                    // @todo correct merging of settings
                    requiredValues.settings = {
                        ...defaultUsage.settings,
                        ...pkg[manifest.options.settingsPath],
                    }
                }
                values = [requiredValues]
            } else {
                // todo throw
            }
        } else {
            values = requiredValues as PackageEntry[]
        }

        if (options.isRoot || (options.root && options.root.options.isRoot)) {
            const development = get(pkg, ['development', type], [] as PackageEntry[])
            const developmentArray = !isArray(development) ? [development] : development
            for (const entry of developmentArray) {
                const match = findIndex(values, o => isDefined(o.name) && o.name === entry.name)
                if (match >= 0) {
                    values[match] = entry
                } else {
                    values.push(entry)
                }
            }
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

                definition.packages.named[type].push({
                    name: entry.name,
                    version: entry.version,
                    definition: entry.definition,
                    repository: entry.repository,
                    settings: entry.settings || {},
                    isBuildDefinition: manifest.options.isBuildDefinition!,
                })
            }
        })
    })

    return definition
}
