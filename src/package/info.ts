import { get, isDefined } from '@zefiros/axioms'
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
    InternalGDSubGSEntry,
    InternalGSSubEntry,
    InternalPDGSEntry,
    InternalPDPSEntry,
    InternalPSSubEntry,
    isInternalGDGS,
    isInternalPDGS,
    isInternalPDPS,
    isInternalPSSub,
} from './internal'
import { PackageType } from './type'

export function classifyType(entry: InternalEntry): PackageType {
    const gdsubgsEntry = entry as InternalGDSubGSEntry
    if (
        has(entry, 'name') &&
        has(entry, 'vendor') &&
        isGitUrl(gdsubgsEntry.repository) &&
        ((isDefined(gdsubgsEntry.definition) && isGitUrl(gdsubgsEntry.definition)) ||
            isUndefined(gdsubgsEntry.definition)) &&
        has(entry, 'definitionPath')
    ) {
        return PackageType.GDSubGS
    }
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
    if (has(entry, 'path') && has(entry, 'name') && get(entry, ['vendor'])) {
        return PackageType.GSSub
    }
    if (has(entry, 'path') && has(entry, 'name')) {
        return PackageType.PSSub
    }
    if (!has(entry, 'path')) {
        return PackageType.PDPS
    }
    throw Error('This should never be called')
}
export const isPackageInfo = <K extends PackageType>(condition: K) => (
    entry: Partial<PackageInfo>
): entry is PackageTypeToInternalEntry[K] => entry.type === condition
export const isGDGS = isPackageInfo(PackageType.GDGS)
export const isGDSubGS = isPackageInfo(PackageType.GDSubGS)
export const isPDPS = isPackageInfo(PackageType.PDPS)
export const isPDGS = isPackageInfo(PackageType.PDGS)
export const isGDPS = isPackageInfo(PackageType.GDPS)
export const isPSSub = isPackageInfo(PackageType.PSSub)
export const isGSSub = isPackageInfo(PackageType.GSSub)

export function getId(info: Partial<PackageInfo>, type: string): string {
    if (isPDPS(info) && info.options) {
        return `${type}:${info.options.rootName}`
    } else if (isPSSub(info) && info.options) {
        return `${type}:${info.options.rootName}:${info.entry.path}`
    } else if (isGSSub(info) && info.options) {
        return `${type}:${info.options.packageVendor}:${info.options.packageName}+${info.entry.path}`
    } else if (isGDGS(info) || isGDSubGS(info) || isPDGS(info)) {
        return `${type}:${info.entry.vendor}:${info.entry.name}`
    } else {
        throw Error('not implemented')
    }
    return ''
}
export function getName(info: Partial<PackageInfo>): string {
    if (isPDPS(info) && info.options) {
        return `${info.options.rootName}`
    } else if (isPSSub(info) && info.options) {
        return `${info.options.rootName}:${info.entry.path}`
    } else if (isGSSub(info) && info.options) {
        return `${info.options.packageVendor}:${info.options.packageName}+${info.entry.path}`
    } else if (isGDGS(info) || isGDSubGS(info)) {
        return `${info.entry.vendor}/${info.entry.name}`
    } else if (isPDGS(info)) {
        return `${info.entry.vendor}/${info.entry.name}`
    } else {
        throw Error('not implemented')
    }
    return ''
}

export function getNameFromEntry(entry: InternalDefinitionEntry): string {
    if (isInternalPDPS(entry) && entry.options) {
        return `${entry.options.rootName}`
    } else if (isInternalPSSub(entry) && entry.options) {
        const rootName = entry.root.vendor
            ? `${entry.root.vendor}/${entry.root.name}`
            : entry.root.name
        return `${rootName}:${entry.entry.path}`
    } else if (isInternalGDGS(entry) || isInternalPDGS(entry)) {
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
    } else if (isPSSub(info) || isGSSub(info) || isGDGS(info) || isGDSubGS(info) || isPDGS(info)) {
        return undefined
    } else {
        throw Error('not implemented')
    }
    return ''
}

export function getDirectories(info: Partial<PackageInfo>): PackageInfo['directories'] {
    if (isPDPS(info) && info.options) {
        const root = info.options.rootDirectory
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
    } else if (isGSSub(info) && info.options) {
        return {
            definition: info.options.rootDirectory,
            source: info.options.packageDirectory,
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
    } else if (isGDSubGS(info)) {
        const root = join(
            environment.directory.packages,
            info.manifest,
            info.entry.vendor,
            info.entry.name
        )
        const definitions = join(
            environment.directory.packages,
            info.manifest,
            "definitions"
        )
        const sourceDir = join(root, `source-${shortHash(info.entry.repository)}`)
        return {
            definition:
                isDefined(info.entry.definition) && info.entry.definition !== info.entry.repository
                    ? join(definitions, `definition-${shortHash(info.entry.definition)}`)
                    : sourceDir,
            source: sourceDir,
        }
    } else if (isPDGS(info) && info.options) {
        const root = join(
            environment.directory.packages,
            info.manifest,
            info.entry.vendor,
            info.entry.name
        )
        const sourceDir = join(root, `source-${shortHash(info.entry.repository)}`)
        return {
            definition: join(info.options.rootDirectory, info.entry.definition),
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
        isSubPackage: pkgType === PackageType.PSSub || pkgType === PackageType.GSSub,
    }
}

export interface PackageTypeToInternalEntry {
    [PackageType.GDGS]: GDGSPackageInfo
    [PackageType.GDSubGS]: GDSubGSPackageInfo
    [PackageType.PDPS]: PDPSPackageInfo
    [PackageType.PDGS]: PDGSPackageInfo
    [PackageType.GDPS]: PackageInfo<InternalGDPSEntry>
    [PackageType.PSSub]: PSSubPackageInfo
    [PackageType.GSSub]: GSSubPackageInfo
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
    isSubPackage: boolean
}
export interface PackageInfoOptions {
    allowDevelopment: boolean
    mayChangeRegistry: boolean
}

export type PDPSPackageInfo = PackageInfo<InternalPDPSEntry, PDPSPackageOptions>
export type PDGSPackageInfo = PackageInfo<InternalPDGSEntry, PDGSPackageOptions>
export type PSSubPackageInfo = PackageInfo<InternalPSSubEntry, PSSubPackageOptions>
export type GSSubPackageInfo = PackageInfo<InternalGSSubEntry, GSSubPackageOptions>
export type GDGSPackageInfo = PackageInfo<InternalGDGSEntry, PackageInfoOptions>
export type GDSubGSPackageInfo = PackageInfo<InternalGDSubGSEntry, PackageInfoOptions>

export interface PDPSPackageOptions extends PackageInfoOptions {
    alias?: string
    rootDirectory: string
    rootName: string
}

export interface PSSubPackageOptions extends PackageInfoOptions {
    rootDirectory: string
    rootName: string
    subPath: string
}
export interface PDGSPackageOptions extends PackageInfoOptions {
    rootName: string
    rootDirectory: string
}
export interface GSSubPackageOptions extends PackageInfoOptions {
    rootName: string
    rootDirectory: string
    packageName: string
    packageVendor?: string
    packageDirectory: string
    subPath: string
}
export interface PSSubPackageOptions extends PackageInfoOptions {}

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
