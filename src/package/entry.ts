import isGitUrl from 'is-git-url'
import { has } from 'lodash'
import { normalizeTrim, toUnix } from 'upath'
import { isUndefined } from 'util'
import { isDefined } from '~/common/util'
import {
    RegistryEntry,
    RegistryGDGSEntry,
    RegistryGDPSEntry,
    RegistryPDGSEntry,
    RegistryPDPSEntry,
    RegistryPSSubEntry,
} from '~/types/definitions.v1'
import {
    PackageEntry,
    PackageGDGSEntry,
    PackageGDPSEntry,
    PackageGSSubEntry,
    PackagePDGSEntry,
    PackagePDPSEntry,
    PackagePSSubEntry,
    PackageSettings,
} from '~/types/package.v1'
import { GSSubPackageOptions, PackageInfoOptions, PDPSPackageOptions } from './info'
import { get } from '@zefiros/axioms/get'
import { varget } from '@zefiros/axioms'

export interface InternalGDGSEntry {
    vendor: string
    name: string
    repository: string
    definition?: string
}
export type InternalGDPSEntry = RegistryGDPSEntry
export interface InternalPDGSEntry {
    vendor: string
    name: string
    repository: string
    definition: string
}
export type InternalPDPSEntry = RegistryPDPSEntry
export type InternalPSSubEntry = RegistryPSSubEntry

export type InternalEntry =
    | InternalGDGSEntry
    | InternalGDPSEntry
    | InternalPDGSEntry
    | InternalPDPSEntry
    | InternalPSSubEntry

export const enum InternalEntryType {
    GDGS = 'GDGS',
    GDPS = 'GDPS',
    PDGS = 'PDGS',
    PDPS = 'PDPS',
    PSSub = 'PSSub',
}

export function transformToInternalEntry(entry: RegistryEntry): InternalEntry {
    if (has(entry, 'path') && has(entry, 'repository')) {
        const pdgsEntry = entry as RegistryPDGSEntry
        const split = pdgsEntry.name.split('/')
        return {
            vendor: split[0],
            name: split[1],
            repository: pdgsEntry.repository,
            definition: pdgsEntry.definition,
        }
    }
    const gdgsEntry = entry as RegistryGDGSEntry
    if (has(entry, 'name') && isDefined(gdgsEntry.repository) && isGitUrl(gdgsEntry.repository)) {
        const split = gdgsEntry.name.split('/')
        return {
            vendor: split[0],
            name: split[1],
            repository: gdgsEntry.repository,
            definition: gdgsEntry.definition,
        }
    }
    if (!has(entry, 'name') && has(entry, 'definition') && has(entry, 'path')) {
        return entry as InternalGDPSEntry
    }
    if (!has(entry, 'name') && has(entry, 'path')) {
        return entry as InternalPDPSEntry
    }
    if (has(entry, 'name') || (has(entry, 'path') || varget(entry, ['path'])!.includes(':'))) {
        return entry as InternalPSSubEntry
    }
    return entry as InternalEntry
}

export interface InternalDefinitionGDGSEntry {
    internalDefinitionType: InternalDefinitionEntyType
    entry: {
        vendor?: string
        name: string
        repository?: string
        definition?: string
    }
    type: string
    options?: PackageInfoOptions
    usage: {
        version: string
        optional: boolean
        settings: PackageSettings
    }
}
export interface InternalDefinitionGDPSEntry {
    internalDefinitionType: InternalDefinitionEntyType
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
    internalDefinitionType: InternalDefinitionEntyType
    entry: {
        vendor?: string
        name: string
        definition: string
        repository?: string
    }
    type: string
    options?: PackageInfoOptions
    usage: {
        version: string
        optional?: boolean
        settings?: PackageSettings
    }
}
export interface InternalDefinitionPDPSEntry {
    internalDefinitionType: InternalDefinitionEntyType
    entry: {
        path: string
    }
    type: string
    options?: PDPSPackageOptions
    usage: {
        optional?: boolean
        settings?: PackageSettings
    }
}

export interface InternalDefinitionGSSubEntry {
    internalDefinitionType: InternalDefinitionEntyType
    root: {
        version: string
        vendor?: string
        name: string
    }
    entry: {
        path: string
    }
    type: string
    options?: GSSubPackageOptions
    usage: {
        optional?: boolean
        settings?: PackageSettings
    }
}

export interface InternalDefinitionPSSubEntry {
    internalDefinitionType: InternalDefinitionEntyType
    root: {
        vendor?: string
        name: string
    }
    entry: {
        path: string
    }
    type: string
    options?: GSSubPackageOptions
    usage: {
        optional?: boolean
        settings?: PackageSettings
    }
}

export type InternalDefinitionEntry =
    | InternalDefinitionGDGSEntry
    | InternalDefinitionGDPSEntry
    | InternalDefinitionPDGSEntry
    | InternalDefinitionPDPSEntry
    | InternalDefinitionGSSubEntry
    | InternalDefinitionPSSubEntry

export const enum InternalDefinitionEntyType {
    GDGS = 'GDGS',
    GDPS = 'GDPS',
    PDGS = 'PDGS',
    PDPS = 'PDPS',
    GSSub = 'GSSub',
    PSSub = 'PSSub',
}

export interface PackageTypeToInternalDefinitionEntry {
    [InternalDefinitionEntyType.GDGS]: InternalDefinitionGDGSEntry
    [InternalDefinitionEntyType.PDPS]: InternalDefinitionPDPSEntry
    [InternalDefinitionEntyType.PDGS]: InternalDefinitionPDGSEntry
    [InternalDefinitionEntyType.GDPS]: InternalDefinitionGDPSEntry
    [InternalDefinitionEntyType.GSSub]: InternalDefinitionGSSubEntry
    [InternalDefinitionEntyType.PSSub]: InternalDefinitionPSSubEntry
}
export const isInternalDefinitionEntry = <K extends InternalDefinitionEntyType>(condition: K) => (
    entry: Partial<InternalDefinitionEntry>
): entry is PackageTypeToInternalDefinitionEntry[K] => entry.internalDefinitionType === condition
export const isInternalGDGS = isInternalDefinitionEntry(InternalDefinitionEntyType.GDGS)
export const isInternalPDPS = isInternalDefinitionEntry(InternalDefinitionEntyType.PDPS)
export const isInternalPDGS = isInternalDefinitionEntry(InternalDefinitionEntyType.PDGS)
export const isInternalGDPS = isInternalDefinitionEntry(InternalDefinitionEntyType.GDPS)
export const isInternalGSSub = isInternalDefinitionEntry(InternalDefinitionEntyType.GSSub)
export const isInternalPSSub = isInternalDefinitionEntry(InternalDefinitionEntyType.PSSub)

export function getInternalDefinitionEntryType(entry: PackageEntry): InternalDefinitionEntyType {
    const gssubEntry = entry as PackageGSSubEntry
    if (has(gssubEntry, 'name') && has(gssubEntry, 'version')) {
        const hasColon = gssubEntry.name.includes(':')
        if (hasColon || gssubEntry.path) {
            return InternalDefinitionEntyType.GSSub
        }
    }
    const pssubEntry = entry as PackagePSSubEntry
    if (has(pssubEntry, 'name')) {
        const hasColon = pssubEntry.name.includes(':')
        if (hasColon || pssubEntry.path) {
            return InternalDefinitionEntyType.PSSub
        }
    }

    const gdgsEntry = entry as PackageGDGSEntry
    if (
        has(entry, 'name') &&
        ((isDefined(gdgsEntry.repository) && isGitUrl(gdgsEntry.repository)) ||
            isUndefined(gdgsEntry.repository)) &&
        ((isDefined(gdgsEntry.definition) && isGitUrl(gdgsEntry.definition)) ||
            isUndefined(gdgsEntry.definition))
    ) {
        return InternalDefinitionEntyType.GDGS
    }
    if (has(entry, 'name') && has(entry, 'definition')) {
        return InternalDefinitionEntyType.PDGS
    }
    const gdpsEntry = entry as PackageGDPSEntry
    if (
        !has(entry, 'name') &&
        has(entry, 'path') &&
        isDefined(gdpsEntry.definition) &&
        isGitUrl(gdpsEntry.definition)
    ) {
        return InternalDefinitionEntyType.GDPS
    }
    if (has(entry, 'path')) {
        return InternalDefinitionEntyType.PDPS
    }
    throw Error('This should never be called')
}

export function getInternalEntryType(entry: PackageEntry): InternalEntryType {
    const gdgsEntry = entry as PackageGDGSEntry
    if (
        has(entry, 'name') &&
        has(entry, 'vendor') &&
        ((isDefined(gdgsEntry.repository) && isGitUrl(gdgsEntry.repository)) ||
            isUndefined(gdgsEntry.repository)) &&
        ((isDefined(gdgsEntry.definition) && isGitUrl(gdgsEntry.definition)) ||
            isUndefined(gdgsEntry.definition))
    ) {
        return InternalEntryType.GDGS
    }
    if (has(entry, 'name') && has(entry, 'vendor') && has(entry, 'definition')) {
        return InternalEntryType.PDGS
    }
    const gdpsEntry = entry as PackageGDPSEntry
    if (
        !has(entry, 'name') &&
        has(entry, 'path') &&
        isDefined(gdpsEntry.definition) &&
        isGitUrl(gdpsEntry.definition)
    ) {
        return InternalEntryType.GDPS
    }
    if (has(entry, 'path')) {
        return InternalEntryType.PDPS
    }
    throw Error('This should never be called')
}

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
): { vendor?: string; name: string; path?: string } {
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
        path,
    }
}

export function transformToInternalDefinitionEntry(
    entry: PackageEntry,
    type: string
): InternalDefinitionEntry {
    const entryType = getInternalDefinitionEntryType(entry)
    switch (entryType) {
        case InternalDefinitionEntyType.PSSub: {
            const pssubEntry = entry as PackagePSSubEntry
            const split = splitVendorNameWithPath(pssubEntry.name)
            const internal: InternalDefinitionPSSubEntry = {
                internalDefinitionType: entryType,
                root: {
                    vendor: split.vendor,
                    name: split.name,
                },
                entry: {
                    path: toUnix(normalizeTrim(split.path || pssubEntry.path || '')).replace(
                        /^\.\//,
                        ''
                    ),
                },
                type,
                usage: {
                    optional: isDefined(pssubEntry.optional) ? pssubEntry.optional : false,
                    settings: pssubEntry.settings || {},
                },
            }
            return internal
        }
        case InternalDefinitionEntyType.GSSub: {
            const gssubEntry = entry as PackageGSSubEntry
            const split = splitVendorNameWithPath(gssubEntry.name)
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
                },
                type,
                usage: {
                    optional: isDefined(gssubEntry.optional) ? gssubEntry.optional : false,
                    settings: gssubEntry.settings || {},
                },
            }
            return internal
        }
        case InternalDefinitionEntyType.GDGS: {
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
                    version: gdgsEntry.version,
                    optional: isDefined(gdgsEntry.optional) ? gdgsEntry.optional : false,
                    settings: gdgsEntry.settings || {},
                },
            }
            return internal
        }
        case InternalDefinitionEntyType.GDPS: {
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
            return internal
        }
        case InternalDefinitionEntyType.PDGS: {
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
                    version: pdgsEntry.version,
                    optional: isDefined(pdgsEntry.optional) ? pdgsEntry.optional : false,
                    settings: pdgsEntry.settings || {},
                },
            }
            return internal
        }
        case InternalDefinitionEntyType.PDPS: {
            const pdpsEntry = entry as PackagePDPSEntry
            const internal: InternalDefinitionPDPSEntry = {
                internalDefinitionType: entryType,
                entry: {
                    path: pdpsEntry.path,
                },
                type,
                usage: {
                    optional: isDefined(pdpsEntry.optional) ? pdpsEntry.optional : false,
                    settings: pdpsEntry.settings || {},
                },
            }
            return internal
        }
    }
}
