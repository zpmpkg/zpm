import { isDefined } from '@zefiros/axioms'
import { get } from '@zefiros/axioms/get'
import { omit } from '@zefiros/axioms/omit'
import { cloneDeep, isArray, isEmpty } from 'lodash'
import { InternalDefinitionEntry, transformToInternalDefinitionEntry } from '~/package/entry'
import { PackageInfo } from '~/package/info'
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
    pkgType: string
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
    return values.map(v => transformToInternalDefinitionEntry(v, type))
}

function addDevelopmentPackages(
    values: InternalDefinitionEntry[],
    info: PackageInfo,
    pkg: PackageDefinition,
    type: string
) {
    if (info.options && info.options.allowDevelopment) {
        const development = get(pkg, ['development', type], [] as PackageEntry[])
        const developmentArray = (!isArray(development) ? [development] : development).map(d =>
            transformToInternalDefinitionEntry(d, type)
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
    type: string
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
        values.push(transformToInternalDefinitionEntry(defaultUsage, type))
    }
}

export function fromPackageDefinition(
    pkg: PackageDefinition,
    info: PackageInfo,
    registries: Registries,
    pkgType: string
): PackageDefinitionSummary {
    const types = registries.getTypes()
    const definition: PackageDefinitionSummary = {
        packages: [],
        definition: omit(pkg, 'requires', 'development'),
    }
    for (const type of types) {
        const manifest = registries.getManifest(type)
        const entries = getEntries(pkg, manifest, type, pkgType)

        addDevelopmentPackages(entries, info, pkg, type)
        setDefaults(entries, manifest, pkgType, pkg, type)

        definition.packages.push(...entries)
    }

    return definition
}
