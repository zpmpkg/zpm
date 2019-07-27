import { get, isDefined, omit } from '@zefiros/axioms'
import { cloneDeep, flatten, isArray, isEmpty } from 'lodash'
import {
    InternalDefinitionEntry,
    PackageInfo,
    PackageVersion,
    transformToInternalDefinitionEntry,
} from '~/package/internal'
import { Manifest } from '~/registry/package'
import { Registries } from '~/registry/registries'
import { PackageDefinition, PackageEntry } from '~/types/package.v1'

export interface PackageDefinitionSummary {
    packages: InternalDefinitionEntry[]
    definition: {
        [k: string]: any
    }
}

export function getEntries(
    pkg: PackageDefinition,
    manifest: Manifest,
    type: string,
    pkgType: string,
    parent: PackageVersion
): InternalDefinitionEntry[] {
    const requiredValues = get(pkg, ['requires', type], [])
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
    return flatten(values.map(v => transformToInternalDefinitionEntry(v, manifest, type, parent)))
}

function addDevelopmentPackages(
    values: InternalDefinitionEntry[],
    manifest: Manifest,
    info: PackageInfo,
    pkg: PackageDefinition,
    type: string,
    parent: PackageVersion
) {
    if (info.options && info.options.allowDevelopment) {
        const development = get(pkg, ['development', type], [] as PackageEntry[])
        const developmentArray = flatten(
            (!isArray(development) ? [development] : development).map(d =>
                transformToInternalDefinitionEntry(d, manifest, type, parent)
            )
        )
        for (const entry of developmentArray) {
            // @todo remove duplicates
            const match = -1 // findIndex(values, o => isDefined(o.name) && o.name === entry.name)
            if (match >= 0) {
                values[match] = entry
            } else {
                values.push(entry)
            }
        }
    }
}

function setDefaults(
    values: InternalDefinitionEntry[],
    manifest: Manifest,
    pkgType: string,
    pkg: PackageDefinition,
    type: string,
    parent: PackageVersion
) {
    if (isEmpty(values) && isDefined((manifest.options.defaults || {})[pkgType])) {
        const defaultUsage: PackageEntry = cloneDeep(manifest.options.defaults![pkgType])
        if (manifest.options.settingsPath && pkg[manifest.options.settingsPath]) {
            // @todo correct merging of settings
            defaultUsage.settings = {
                ...defaultUsage.settings,
                ...pkg[manifest.options.settingsPath],
            }
        }
        values.push(...transformToInternalDefinitionEntry(defaultUsage, manifest, type, parent))
    }
}

export function fromPackageDefinition(
    pkg: PackageDefinition,
    info: PackageInfo,
    registries: Registries,
    pkgType: string,
    parent: PackageVersion
): PackageDefinitionSummary {
    const types = registries.getTypes()
    const definition: PackageDefinitionSummary = {
        packages: [],
        definition: omit(pkg, 'requires', 'development'),
    }
    for (const type of types) {
        const manifest = registries.getManifest(type)
        const entries = getEntries(pkg, manifest, type, pkgType, parent)

        addDevelopmentPackages(entries, manifest, info, pkg, type, parent)
        setDefaults(entries, manifest, pkgType, pkg, type, parent)

        definition.packages.push(...entries)
    }

    return definition
}
