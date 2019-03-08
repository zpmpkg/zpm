import { forEach, get, isArray, isEmpty, keys, uniq } from 'lodash'
import { isDefined } from '~/common/util'
import { Registries } from '~/registry/registries'
import { isGitPackageEntry, isPathPackageEntry } from '~/solver/package'
import { PackageDefinition, PackageGitEntry, PackagePathEntry } from '~/types/package.v1'
import { PackageOptions } from '../../registry/package'

interface PackagePathDefinitionEntry extends PackagePathEntry {
    singular: boolean
}
interface PackageGitDefinitionEntry extends PackageGitEntry {
    singular: boolean
}

export interface PackageDefinitionSummary {
    packages: {
        path: { [k: string]: PackagePathDefinitionEntry[] }
        git: { [k: string]: PackageGitDefinitionEntry[] }
    }
    description: PackageDescription
}

export interface PackageDescription {
    extraction: {}
    build: {}
}

export function fromPackageDefinition(
    pkg: PackageDefinition,
    options: PackageOptions,
    registries: Registries,
    pkgType: string
): PackageDefinitionSummary {
    // @todo just loop all available
    const types: string[] = uniq([
        ...keys(get(pkg, 'requires')),
        ...keys(get(pkg, 'development')),
        'extractor',
        'builder',
    ])
    const definition: PackageDefinitionSummary = {
        packages: {
            path: {},
            git: {},
        },
        description: {
            extraction: {},
            build: {},
        },
    }

    forEach(types, type => {
        const manifest = registries.getManifest(type)
        let values = get(pkg, ['requires', type], [])
        if (!isArray(values)) {
            if (manifest.options.singular) {
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
            values.push(manifest.options.defaults![pkgType])
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
                    singular: manifest.options.singular!,
                })
            } else if (isGitPackageEntry(entry)) {
                if (!isDefined(definition.packages.git[type])) {
                    definition.packages.git[type] = []
                }

                definition.packages.git[type].push({
                    name: entry.name,
                    version: entry.version,
                    settings: entry.settings || {},
                    singular: manifest.options.singular!,
                })
            }
        })
    })

    return definition
}
