import { get, varget } from '@zefiros/axioms'
import isGitUrl from 'is-git-url'
import { has } from 'lodash'
import { join, normalizeTrim, toUnix } from 'upath'
import { isUndefined } from 'util'
import { VersionRange } from '~/common/range'
import { isDefined } from '~/common/util'
import { Manifest } from '~/registry/package'
import {
    RegistryEntry,
    RegistryGDGSEntry,
    RegistryGDPSEntry,
    RegistryGDSubGSEntry,
    RegistryPDGSEntry,
} from '~/types/definitions.v1'
import {
    PackageEntry,
    PackageGDGSEntry,
    PackageGDPSEntry,
    PackageGDSubGSEntry,
    PackageGSSubEntry,
    PackagePDGSEntry,
    PackagePDPSEntry,
    PackagePSSubEntry,
    PackageSettings,
} from '~/types/package.v1'
import { isInternalGSSub, isInternalPDGS } from './entryType'
import { isGDGS, isGDSubGS, isGSSub, isPDGS, PackageInfo, PDGSPackageOptions } from './info'
import {
    GSSubPackageOptions,
    InternalDefinitionEntryType,
    isInternalPSSub,
    isPDPS,
    isPSSub,
    PackageInfoOptions,
    PackageVersion,
    PDPSPackageOptions,
    PSSubPackageOptions,
} from './internal'
import { SourceVersion } from './sourceVersion'
import { PackageType } from './type'

export interface InternalGDGSEntry {
    // type: InternalEntryType.GDGS
    vendor: string
    name: string
    repository: string
    definition?: string
}
export interface InternalGDSubGSEntry {
    // type: InternalEntryType.GDGS
    vendor: string
    name: string
    repository: string
    definition: string
    definitionPath: string
}
export interface InternalGDPSEntry {
    // type: InternalEntryType.GDPS
    definition: string
    path: string
}
export interface InternalPDGSEntry {
    // type: InternalEntryType.PDGS
    vendor?: string
    name: string
    repository: string
    definition: string
}
export interface InternalPDPSEntry {
    // type: InternalEntryType.PDPS
}
export interface InternalPSSubEntry {
    // type: InternalEntryType.PSSub
    name: string
    path: string
}

export interface InternalGSSubEntry {
    // type: InternalEntryType.GSSub
    vendor?: string
    name: string
    path: string
    repository: string
}

export type InternalEntry =
    | InternalGDGSEntry
    | InternalGDSubGSEntry
    | InternalGDPSEntry
    | InternalPDGSEntry
    | InternalPDPSEntry
    | InternalPSSubEntry
    | InternalGSSubEntry

export const enum InternalEntryType {
    GDGS = 'GDGS',
    GDSubGS = 'GDSubGS',
    GDPS = 'GDPS',
    PDGS = 'PDGS',
    PDPS = 'PDPS',
    PSSub = 'PSSub',
    GSSub = 'GSSub',
}

export function transformToInternalEntry(entry: RegistryEntry): InternalEntry {
    if (has(entry, 'path') && has(entry, 'repository')) {
        const pdgsEntry = entry as RegistryPDGSEntry
        const split = pdgsEntry.name.split('/')
        return {
            // type: InternalEntryType.PDGS,
            vendor: split[0],
            name: split[1],
            repository: pdgsEntry.repository,
            definition: pdgsEntry.definition,
        }
    }
    const gdsubgsEntry = entry as RegistryGDSubGSEntry
    if (
        has(entry, 'name') &&
        isDefined(gdsubgsEntry.repository) &&
        isGitUrl(gdsubgsEntry.repository) &&
        isDefined(gdsubgsEntry.definition) &&
        isGitUrl(gdsubgsEntry.definition) &&
        isDefined(gdsubgsEntry.definitionPath)
    ) {
        const split = gdsubgsEntry.name.split('/')
        return {
            // type: InternalEntryType.GDGS,
            vendor: split[0],
            name: split[1],
            repository: gdsubgsEntry.repository,
            definition: gdsubgsEntry.definition,
            definitionPath: gdsubgsEntry.definitionPath,
        }
    }
    const gdgsEntry = entry as RegistryGDGSEntry
    if (has(entry, 'name') && isDefined(gdgsEntry.repository) && isGitUrl(gdgsEntry.repository)) {
        const split = gdgsEntry.name.split('/')
        return {
            // type: InternalEntryType.GDGS,
            vendor: split[0],
            name: split[1],
            repository: gdgsEntry.repository,
            definition: gdgsEntry.definition,
        }
    }
    if (!has(entry, 'name') && has(entry, 'definition') && has(entry, 'path')) {
        return {
            // type: InternalEntryType.GDPS,
            ...(entry as RegistryGDPSEntry),
        }
    }
    if (!has(entry, 'name') && !has(entry, 'path')) {
        return {}
    }
    // if (has(entry, 'name') || (has(entry, 'path') || varget(entry, ['path'])!.includes(':'))) {
    //     const subentry = entry as RegistryPSSubEntry
    //     if (varget(subentry, ['path'])!.includes(':'))) {
    //         return {
    //             type: InternalEntryType.PSSub,
    //             ...(subentry as RegistryPSSubEntry),
    //         }
    //     }
    //     else {
    //         return {
    //             type: InternalEntryType.PSSub,
    //             ...(entry as RegistryPSSubEntry),
    //         }
    //     }
    // }
    throw new Error('not implemented')
}

export interface InternalDefinitionGDGSEntry {
    internalDefinitionType: InternalDefinitionEntryType
    entry: {
        vendor?: string
        name: string
        repository?: string
        definition?: string
    }
    type: string
    options?: PackageInfoOptions
    usage: {
        version: VersionRange
        optional: boolean
        settings: PackageSettings
    }
}
export interface InternalDefinitionGDSubGSEntry {
    internalDefinitionType: InternalDefinitionEntryType
    entry: {
        vendor?: string
        name: string
        repository?: string
        definition?: string
        definitionPath: string
    }
    type: string
    options?: PackageInfoOptions
    usage: {
        version: VersionRange
        optional: boolean
        settings: PackageSettings
    }
}
export interface InternalDefinitionGDPSEntry {
    internalDefinitionType: InternalDefinitionEntryType
    entry: {
        definition: string
        path: string
    }
    type: string
    options?: PackageInfoOptions
    usage: {
        optional: boolean
        settings: PackageSettings
    }
}
export interface InternalDefinitionPDGSEntry {
    internalDefinitionType: InternalDefinitionEntryType
    entry: {
        vendor?: string
        name: string
        definition: string
        repository?: string
    }
    type: string
    options?: PackageInfoOptions
    usage: {
        version: VersionRange
        optional: boolean
        settings: PackageSettings
    }
}
export interface InternalDefinitionPDPSEntry {
    internalDefinitionType: InternalDefinitionEntryType
    entry: {}
    type: string
    options?: PDPSPackageOptions
    usage: {
        optional: boolean
        settings: PackageSettings
    }
}

export interface InternalDefinitionGSSubEntry {
    internalDefinitionType: InternalDefinitionEntryType
    root: {
        version: string
        vendor?: string
        name: string
    }
    entry: {
        path: string
        repository: string
    }
    type: string
    options?: GSSubPackageOptions
    usage: {
        optional: boolean
        settings: PackageSettings
    }
}

export interface InternalDefinitionPSSubEntry {
    internalDefinitionType: InternalDefinitionEntryType
    root: {
        vendor?: string
        name: string
    }
    entry: {
        path: string
    }
    type: string
    options?: PSSubPackageOptions
    usage: {
        optional: boolean
        settings: PackageSettings
    }
}

export type InternalDefinitionEntry =
    | InternalDefinitionGDGSEntry
    | InternalDefinitionGDPSEntry
    | InternalDefinitionPDGSEntry
    | InternalDefinitionPDPSEntry
    | InternalDefinitionGSSubEntry
    | InternalDefinitionPSSubEntry

export function getInternalDefinitionEntryType(entry: PackageEntry): InternalDefinitionEntryType {
    const gssubEntry = entry as PackageGSSubEntry
    if (has(gssubEntry, 'name') && gssubEntry.name.includes('/') && has(gssubEntry, 'version')) {
        const hasColon = gssubEntry.name.includes(':')
        if (hasColon || gssubEntry.path) {
            return InternalDefinitionEntryType.GSSub
        }
    }
    const pssubEntry = entry as PackagePSSubEntry
    if (
        (has(pssubEntry, 'name') || has(pssubEntry, 'path')) &&
        !has(pssubEntry, 'repository') &&
        !has(pssubEntry, 'definition')
    ) {
        const hasColon = (pssubEntry.name || '').includes(':')
        if (hasColon || pssubEntry.path) {
            return InternalDefinitionEntryType.PSSub
        }
    }

    const gdsubgsEntry = entry as PackageGDSubGSEntry
    if (
        has(entry, 'name') &&
        has(entry, 'definitionPath') &&
        ((isDefined(gdsubgsEntry.repository) && isGitUrl(gdsubgsEntry.repository)) ||
            isUndefined(gdsubgsEntry.repository)) &&
        ((isDefined(gdsubgsEntry.definition) && isGitUrl(gdsubgsEntry.definition)) ||
            isUndefined(gdsubgsEntry.definition))
    ) {
        return InternalDefinitionEntryType.GDSubGS
    }
    const gdgsEntry = entry as PackageGDGSEntry
    if (
        has(entry, 'name') &&
        ((isDefined(gdgsEntry.repository) && isGitUrl(gdgsEntry.repository)) ||
            isUndefined(gdgsEntry.repository)) &&
        ((isDefined(gdgsEntry.definition) && isGitUrl(gdgsEntry.definition)) ||
            isUndefined(gdgsEntry.definition))
    ) {
        return InternalDefinitionEntryType.GDGS
    }

    if (has(entry, 'name') && has(entry, 'definition')) {
        return InternalDefinitionEntryType.PDGS
    }
    const gdpsEntry = entry as PackageGDPSEntry
    if (
        !has(entry, 'name') &&
        has(entry, 'path') &&
        isDefined(gdpsEntry.definition) &&
        isGitUrl(gdpsEntry.definition)
    ) {
        return InternalDefinitionEntryType.GDPS
    }
    // PDPS is always defined manually and not from a definition
    if (!has(entry, 'path')) {
        return InternalDefinitionEntryType.PDPS
    }

    throw Error('This should never be called')
}

export function internalDefinitionSubToInternalEntry(definition: InternalDefinitionEntry) {
    // if (isInternalGSSub(definition)) {
    //     return
    // } else
    if (isInternalPSSub(definition) && definition.options) {
        const entry: InternalPSSubEntry = {
            name: definition.options.rootName,
            path: definition.entry.path,
        }
        return entry
    }
    if (isInternalGSSub(definition) && definition.options) {
        const entry: InternalGSSubEntry = {
            name: definition.options.packageName,
            vendor: definition.options.packageVendor,
            path: definition.entry.path,
            repository: definition.entry.repository,
        }
        return entry
    }
    throw new Error('Failed to convert entry')
}

export function overrideInternalDefinitionToInternalEntry(
    definition: InternalDefinitionEntry,
    overriding?: PackageInfo
) {
    if (
        isInternalPDGS(definition) &&
        (!isDefined(overriding) ||
            (isDefined(overriding) &&
                (isPDGS(overriding) || isGDGS(overriding) || isGDSubGS(overriding))))
    ) {
        if (!isDefined(overriding) && !isDefined(definition.entry.repository)) {
            throw new Error()
            // @todo
        }
        const entry: InternalPDGSEntry = {
            vendor: definition.entry.vendor || get(overriding, ['entry', 'vendor']),
            name: definition.entry.name,
            repository: definition.entry.repository || get(overriding, ['entry', 'repository']),
            definition:
                definition.entry.definition ||
                get(overriding, ['entry', 'definition']) ||
                definition.entry.repository ||
                get(overriding, ['entry', 'repository']),
        }
        return entry
    }
    throw new Error('Failed to convert entry')
}
export function overrideInternalDefinitionOptions<T extends PackageInfoOptions>(
    coptions: T,
    definition: InternalDefinitionEntry,
    addedBy: PackageInfo
): PackageInfoOptions {
    if (isInternalPDGS(definition)) {
        const options: PDGSPackageOptions = {
            ...coptions,
            rootDirectory: addedBy.directories.definition,
            rootName: addedBy.alias || addedBy.name,
        }
        return options
    }
    throw new Error('Failed to convert entry')
}

// export function getInternalEntryType(entry: PackageEntry): InternalEntryType {
//     const gdsubgsEntry = entry as PackageGDGSEntry
//     if (
//         has(entry, 'name') &&
//         has(entry, 'vendor') &&
//         has(entry, 'definitionPath') &&
//         ((isDefined(gdsubgsEntry.repository) && isGitUrl(gdsubgsEntry.repository)) ||
//             isUndefined(gdsubgsEntry.repository)) &&
//         ((isDefined(gdsubgsEntry.definition) && isGitUrl(gdsubgsEntry.definition)) ||
//             isUndefined(gdsubgsEntry.definition))
//     ) {
//         return InternalEntryType.GDSubGS
//     }
//     const gdgsEntry = entry as PackageGDGSEntry
//     if (
//         has(entry, 'name') &&
//         has(entry, 'vendor') &&
//         ((isDefined(gdgsEntry.repository) && isGitUrl(gdgsEntry.repository)) ||
//             isUndefined(gdgsEntry.repository)) &&
//         ((isDefined(gdgsEntry.definition) && isGitUrl(gdgsEntry.definition)) ||
//             isUndefined(gdgsEntry.definition))
//     ) {
//         return InternalEntryType.GDGS
//     }
//     if (has(entry, 'name') && has(entry, 'vendor') && has(entry, 'definition')) {
//         return InternalEntryType.PDGS
//     }
//     const gdpsEntry = entry as PackageGDPSEntry
//     if (
//         !has(entry, 'name') &&
//         has(entry, 'path') &&
//         isDefined(gdpsEntry.definition) &&
//         isGitUrl(gdpsEntry.definition)
//     ) {
//         return InternalEntryType.GDPS
//     }
//     if (has(entry, 'path')) {
//         return InternalEntryType.PDPS
//     }
//     throw Error('This should never be called')
// }

export function splitVendorName(vendorName: string): { vendor?: string; name: string } {
    let [vendor, name]: Array<string | undefined> = vendorName.split('/')
    if (!name) {
        name = vendor
        vendor = undefined
    }
    return {
        vendor,
        name,
    }
}

export function splitVendorNameWithPath(
    vendorName: string
): { vendor?: string; name: string; path?: string; fullName?: string } {
    let path: string | undefined
    if (vendorName.includes(':')) {
        const [name, p]: Array<string | undefined> = vendorName.split(':')
        if (p) {
            vendorName = name
            path = p
        }
    }
    return {
        ...splitVendorName(vendorName),
        fullName: vendorName,
        path,
    }
}

export function transformToInternalDefinitionEntry(
    entry: PackageEntry,
    manifest: Manifest,
    type: string,
    parent: PackageVersion
): InternalDefinitionEntry[] {
    const entryType = getInternalDefinitionEntryType(entry)
    switch (entryType) {
        case InternalDefinitionEntryType.PSSub: {
            const pssubEntry = entry as PackagePSSubEntry
            let options: InternalDefinitionPSSubEntry['options']
            let split: ReturnType<typeof splitVendorNameWithPath>
            let subPath = './'
            if (isDefined(pssubEntry.name)) {
                split = splitVendorNameWithPath(pssubEntry.name)
                const namedParent = manifest.searchByName(split.name)
                if (!namedParent) {
                    throw new Error('parent not found')
                    // @todo
                }
                options = {
                    allowDevelopment: get(namedParent.info.options, ['allowDevelopment'], false),
                    mayChangeRegistry: false,
                    rootName: split.name,
                    rootDirectory: namedParent.info.directories.source,
                    subPath,
                }
            } else if (isPDGS(parent.package.info)) {
                split = {
                    vendor: parent.package.info.entry.vendor,
                    name: parent.package.info.entry.name,
                }
                options = {
                    allowDevelopment: get(parent.package.info.options, ['allowDevelopment'], false),
                    mayChangeRegistry: get(
                        parent.package.info.options,
                        ['mayChangeRegistry'],
                        false
                    ),
                    rootName: parent.package.info.name,
                    rootDirectory: parent.package.info.options!.rootDirectory,
                    subPath,
                }
            } else {
                if (
                    !isPDPS(parent.package.info) &&
                    !isPSSub(parent.package.info) &&
                    !isGSSub(parent.package.info)
                ) {
                    throw new Error(`Parent package should have been PDPS or PSSub or GSSub`)
                }
                subPath = varget(parent.package.info.options, ['subPath'], './')
                split = splitVendorNameWithPath(parent.package.info.options!.rootName)
                options = {
                    allowDevelopment: get(parent.package.info.options, ['allowDevelopment'], false),
                    mayChangeRegistry: get(
                        parent.package.info.options,
                        ['mayChangeRegistry'],
                        false
                    ),
                    rootName: parent.package.info.options!.rootName,
                    rootDirectory: parent.package.info.options!.rootDirectory,
                    subPath,
                }
            }
            options.subPath = toUnix(
                normalizeTrim(join(subPath, split.path || pssubEntry.path || ''))
            ).replace(/^\.\//, '')
            const internal: InternalDefinitionPSSubEntry = {
                internalDefinitionType: entryType,
                root: {
                    vendor: split.vendor,
                    name: split.name,
                },
                entry: {
                    path: options.subPath,
                },
                options,
                type,
                usage: {
                    optional: isDefined(pssubEntry.optional) ? pssubEntry.optional : false,
                    settings: pssubEntry.settings || {},
                },
            }
            return [internal]
        }
        case InternalDefinitionEntryType.GSSub: {
            const gssubEntry = entry as PackageGSSubEntry
            const split = splitVendorNameWithPath(gssubEntry.name)
            if (!split.fullName) {
                throw new Error('parent not found')
                // @todo
            }
            const namedParent = manifest.searchByName(split.fullName)
            if (!namedParent || !isGDGS(namedParent.info)) {
                throw new Error('parent not found')
                // @todo
            }
            const subPath = varget(namedParent.info.options, ['subPath'], './')
            const internal: InternalDefinitionGSSubEntry = {
                internalDefinitionType: entryType,
                root: {
                    version: gssubEntry.version,
                    vendor: split.vendor,
                    name: split.name,
                },
                entry: {
                    path: toUnix(normalizeTrim(split.path || gssubEntry.path || '')).replace(
                        /^\.\//,
                        ''
                    ),
                    repository: namedParent.info.entry.repository,
                },
                options: {
                    allowDevelopment: false,
                    mayChangeRegistry: get(
                        parent.package.info.options,
                        ['mayChangeRegistry'],
                        false
                    ),
                    rootName: varget(parent.package.info.options, ['rootName']),
                    rootDirectory: parent.package.info.directories.definition,
                    packageName: namedParent.info.entry.name,
                    packageVendor: namedParent.info.entry.vendor,
                    packageDirectory: namedParent.info.directories.source,
                    subPath: toUnix(
                        normalizeTrim(join(subPath, split.path || gssubEntry.path || ''))
                    ).replace(/^\.\//, ''),
                },
                type,
                usage: {
                    optional: isDefined(gssubEntry.optional) ? gssubEntry.optional : false,
                    settings: gssubEntry.settings || {},
                },
            }
            const rootEntry: PackageGDGSEntry = {
                name: split.fullName,
                version: internal.root.version,
            }
            return [
                ...transformToInternalDefinitionEntry(rootEntry, manifest, type, parent),
                internal,
            ]
        }
        case InternalDefinitionEntryType.GDGS: {
            const gdgsEntry = entry as PackageGDGSEntry
            const internal: InternalDefinitionGDGSEntry = {
                internalDefinitionType: entryType,
                entry: {
                    ...splitVendorName(gdgsEntry.name),
                    repository: gdgsEntry.repository,
                    definition: gdgsEntry.definition,
                },
                type,
                usage: {
                    version: new VersionRange(gdgsEntry.version),
                    optional: isDefined(gdgsEntry.optional) ? gdgsEntry.optional : false,
                    settings: gdgsEntry.settings || {},
                },
            }
            return [internal]
        }
        case InternalDefinitionEntryType.GDSubGS: {
            const gdsubgsEntry = entry as PackageGDSubGSEntry
            const internal: InternalDefinitionGDSubGSEntry = {
                internalDefinitionType: entryType,
                entry: {
                    ...splitVendorName(gdsubgsEntry.name),
                    repository: gdsubgsEntry.repository,
                    definition: gdsubgsEntry.definition,
                    definitionPath: gdsubgsEntry.definitionPath,
                },
                type,
                usage: {
                    version: new VersionRange(gdsubgsEntry.version),
                    optional: isDefined(gdsubgsEntry.optional) ? gdsubgsEntry.optional : false,
                    settings: gdsubgsEntry.settings || {},
                },
            }
            return [internal]
        }
        case InternalDefinitionEntryType.GDPS: {
            const gdpsEntry = entry as PackageGDPSEntry
            const internal: InternalDefinitionGDPSEntry = {
                internalDefinitionType: entryType,
                entry: {
                    definition: gdpsEntry.definition,
                    path: gdpsEntry.path,
                },
                type,
                usage: {
                    optional: isDefined(gdpsEntry.optional) ? gdpsEntry.optional : false,
                    settings: gdpsEntry.settings || {},
                },
            }
            return [internal]
        }
        case InternalDefinitionEntryType.PDGS: {
            const pdgsEntry = entry as PackagePDGSEntry
            const internal: InternalDefinitionPDGSEntry = {
                internalDefinitionType: entryType,
                entry: {
                    ...splitVendorName(pdgsEntry.name),
                    repository: pdgsEntry.repository,
                    definition: pdgsEntry.definition,
                },
                type,
                usage: {
                    version: new VersionRange(pdgsEntry.version),
                    optional: isDefined(pdgsEntry.optional) ? pdgsEntry.optional : false,
                    settings: pdgsEntry.settings || {},
                },
            }
            return [internal]
        }
        case InternalDefinitionEntryType.PDPS: {
            const pdpsEntry = entry as PackagePDPSEntry
            const internal: InternalDefinitionPDPSEntry = {
                internalDefinitionType: entryType,
                entry: {},
                type,
                usage: {
                    optional: isDefined(pdpsEntry.optional) ? pdpsEntry.optional : false,
                    settings: pdpsEntry.settings || {},
                },
            }
            return [internal]
        }
    }
}
