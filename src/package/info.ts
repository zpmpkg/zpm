import { isDefined } from '@zefiros/axioms'
import { get } from '@zefiros/axioms/get'
import isGitUrl from 'is-git-url'
import { has, isUndefined } from 'lodash'
import { join } from 'upath'
import { environment } from '~/common/environment'
import { shortHash } from '~/common/util'
import {
    InternalDefinitionEntry,
    InternalEntry,
    InternalGDGSEntry,
    InternalGDPSEntry,
    InternalPDGSEntry,
    InternalPDPSEntry,
    isInternalGDGS,
    isInternalPDPS,
    isInternalPSSub,
    InternalPSSubEntry,
} from './entry'
import { PackageType } from './type'

export function classifyType(entry: InternalEntry): PackageType {
    const gdgsEntry = entry as InternalGDGSEntry
    if (
        has(entry, 'name') &&
        has(entry, 'vendor') &&
        isGitUrl(gdgsEntry.repository) &&
        ((isDefined(gdgsEntry.definition) && isGitUrl(gdgsEntry.definition)) ||
            isUndefined(gdgsEntry.definition)) &&
        !has(entry, 'path')
    ) {
        return PackageType.GDGS
    }
    if (
        has(entry, 'name') &&
        has(entry, 'vendor') &&
        has(entry, 'repository') &&
        has(entry, 'definition')
    ) {
        return PackageType.PDGS
    }
    const gdpsEntry = entry as InternalGDPSEntry
    if (
        !has(entry, 'name') &&
        has(entry, 'path') &&
        isDefined(gdpsEntry.definition) &&
        isGitUrl(gdpsEntry.definition)
    ) {
        return PackageType.GDPS
    }
    if (has(entry, 'path') && has(entry, 'name')) {
        return PackageType.PSSub
    }
    if (has(entry, 'path')) {
        return PackageType.PDPS
    }
    throw Error('This should never be called')
}
export const isPackageInfo = <K extends PackageType>(condition: K) => (
    entry: Partial<PackageInfo>
): entry is PackageTypeToInternalEntry[K] => entry.type === condition
export const isGDGS = isPackageInfo(PackageType.GDGS)
export const isPDPS = isPackageInfo(PackageType.PDPS)
export const isPDGS = isPackageInfo(PackageType.PDGS)
export const isGDPS = isPackageInfo(PackageType.GDPS)
export const isPSSub = isPackageInfo(PackageType.PSSub)

export function getId(info: Partial<PackageInfo>, type: string): string {
    if (isPDPS(info) && info.options) {
        return `${type}:${info.options.rootName}:${info.entry.path}`
    } else if (isPSSub(info) && info.options) {
        return `${type}:${info.options.rootName}:${info.entry.path}`
    } else if (isGDGS(info)) {
        return `${type}:${info.entry.name}`
    } else {
        throw Error('not implemented')
    }
    return ''
}
export function getName(info: Partial<PackageInfo>): string {
    if (isPDPS(info) && info.options) {
        return `${info.options.rootName}:${info.entry.path}`
    } else if (isPSSub(info) && info.options) {
        return `${info.options.rootName}:${info.entry.path}`
    } else if (isGDGS(info)) {
        return `${info.entry.name}`
    } else {
        throw Error('not implemented')
    }
    return ''
}
export function getNameFromEntry(entry: InternalDefinitionEntry): string {
    if (isInternalPDPS(entry) && entry.options) {
        return `${entry.options.rootName}:${entry.entry.path}`
    } else if (isInternalPSSub(entry)) {
        const rootName = entry.root.vendor
            ? `${entry.root.vendor}/${entry.root.name}`
            : entry.root.name
        return `${rootName}:${entry.entry.path}`
    } else if (isInternalGDGS(entry)) {
        if (entry.entry.vendor) {
            return `${entry.entry.vendor}/${entry.entry.name}`
        }
        return `${entry.entry.name}`
    } else {
        throw Error('not implemented')
    }
    return ''
}

export function getAlias(info: Partial<PackageInfo>): string | undefined {
    if (isPDPS(info)) {
        return get(info, ['options', 'alias'])
    } else if (isPSSub(info)) {
        return undefined
    } else if (isGDGS(info)) {
        return undefined
    } else {
        throw Error('not implemented')
    }
    return ''
}

export function getDirectories(info: Partial<PackageInfo>): PackageInfo['directories'] {
    if (isPDPS(info) && info.options) {
        const root = join(info.options.rootDirectory, info.entry.path)
        return {
            definition: root,
            source: root,
        }
    } else if (isPSSub(info) && info.options) {
        const sub = join(info.options.rootDirectory, info.entry.path)
        return {
            definition: sub,
            source: sub,
        }
    } else if (isGDGS(info)) {
        const root = join(
            environment.directory.packages,
            info.manifest,
            info.entry.vendor,
            info.entry.name
        )
        const sourceDir = join(root, `source-${shortHash(info.entry.repository)}`)
        return {
            definition:
                isDefined(info.entry.definition) && info.entry.definition !== info.entry.repository
                    ? join(root, `definition-${shortHash(info.entry.definition)}`)
                    : sourceDir,
            source: sourceDir,
        }
    } else {
        throw Error('not implemented')
    }
    return {
        definition: '',
        source: '',
    }
}

export function getPackageInfo<E extends InternalEntry, O extends PackageInfoOptions>(
    entry: E,
    type: string,
    pkgType: PackageType,
    options?: O
): PackageInfo<E, O> {
    const info = {
        entry,
        manifest: type,
        type: pkgType,
        options,
    }
    return {
        ...info,
        name: getName(info),
        alias: getAlias(info),
        directories: getDirectories(info),
        id: getId(info, type),
    }
}

export interface PackageTypeToInternalEntry {
    [PackageType.GDGS]: GDGSPackageInfo
    [PackageType.PDPS]: PDPSPackageInfo
    [PackageType.PDGS]: PackageInfo<InternalPDGSEntry>
    [PackageType.GDPS]: PackageInfo<InternalGDPSEntry>
    [PackageType.PSSub]: PSSubPackageInfo
}

export interface PackageInfo<E = InternalEntry, O = PackageInfoOptions> {
    type: PackageType
    entry: E
    id: string
    name: string
    directories: {
        definition: string
        source: string
    }
    manifest: string
    alias?: string
    options?: O
}
export interface PackageInfoOptions {
    allowDevelopment: boolean
}

export type PDPSPackageInfo = PackageInfo<InternalPDPSEntry, PDPSPackageOptions>
export type PSSubPackageInfo = PackageInfo<InternalPSSubEntry, PSSubPackageOptions>
export type GDGSPackageInfo = PackageInfo<InternalGDGSEntry, PackageInfoOptions>

export interface PDPSPackageOptions extends PackageInfoOptions {
    alias?: string
    rootDirectory: string
    rootName: string
}

export interface PSSubPackageOptions extends PackageInfoOptions {
    rootDirectory: string
    rootName: string
}
export interface GSSubPackageOptions extends PackageInfoOptions {}

// export function composeEntry(entry: InternalDefinitionEntry): ComposedEntry {
//     const entryType = getInternalEntryType(entry)
//     switch (entryType) {
//         case InternalEntryType.GDGS:
//             return {
//                 type: entryType,
//                 usage: entry,
//                 registry: undefined,
//                 mayBeRegistered: false,
//             }

//         case InternalEntryType.GDPS: {
//             const gdps = entry as InternalDefinitionGDPSEntry
//             const internal: InternalGDPSEntry = {
//                 path: gdps.path,
//                 definition: gdps.definition,
//             }
//             return {
//                 type: entryType,
//                 usage: entry,
//                 registry: internal,
//                 mayBeRegistered: true,
//             }
//         }
//         case InternalEntryType.PDGS: {
//             const pdgs = entry as InternalDefinitionPDGSEntry
//             const internal: InternalPDGSEntry = {
//                 name: pdgs.name,
//                 vendor: pdgs.vendor,
//                 repository: pdgs.repository,
//                 definition: pdgs.definition,
//             }
//             return {
//                 type: entryType,
//                 usage: entry,
//                 registry: internal,
//                 mayBeRegistered: true,
//             }
//         }
//         case InternalEntryType.PDPS: {
//             return {
//                 type: entryType,
//                 usage: entry,
//                 registry: undefined,
//                 mayBeRegistered: false,
//             }
//         }
//     }
// }
