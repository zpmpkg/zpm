import { get, isDefined, varget } from '@zefiros/axioms'
import { join, normalizeTrim, toUnix } from 'upath'
import { logger } from '~/common/logger'
import { Version } from '~/common/version'
import { PackageDefinitionSummary } from '~/resolver/definition/definition'
import { getPathPackageDefinition } from '~/resolver/definition/path'
import { Manifest } from '~registry/package'
import { PackagePSSubEntry } from '~types/package.v1'
import {
    InternalDefinitionEntryType,
    InternalDefinitionPSSubEntry,
    IPackage,
    IPackageVersion,
    isGSSub,
    isPDGS,
    isPDPS,
    isPSSub,
    PackageVersion,
    ParentUsage,
    PSSubPackageInfo,
    splitVendorNameWithPath,
} from './internal'

export class PSSubPackageVersion extends IPackageVersion {
    public async getDefinition(parent: PackageVersion): Promise<PackageDefinitionSummary> {
        logger.logfile.info(
            `Trying to read '${this.package.info.entry.path}' from '${this.package.info.directories.definition}`
        )
        return getPathPackageDefinition(this.package, parent)
    }

    public getCost(): number {
        return Version.versionInverse - Version.majorVersionCost
    }

    public getTargetPath(): string | undefined {
        return undefined
    }

    public getBuildPath(): string {
        return this.package.info.directories.source
    }

    public get package(): PSSubPackage {
        return this._package as PSSubPackage
    }

    public addUsage(usage: ParentUsage): boolean {
        const entry = usage.entry as InternalDefinitionPSSubEntry

        if (!isDefined(this.version.usedBy[usage.addedBy.id])) {
            this.version.usedBy[usage.addedBy.id] = {
                settings: entry.usage.settings,
                optional: isDefined(entry.usage.optional) ? entry.usage.optional : false,
            }
        }
        return true
    }
}

export class PSSubPackage extends IPackage {
    public static toInternalDefinition(
        type: string,
        manifest: Manifest,
        packageEntry: PackagePSSubEntry,
        parent: PackageVersion
    ): InternalDefinitionPSSubEntry {
        let options: InternalDefinitionPSSubEntry['options']
        let split: ReturnType<typeof splitVendorNameWithPath>
        let subPath = './'
        if (isDefined(packageEntry.name)) {
            split = splitVendorNameWithPath(packageEntry.name)
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
                mayChangeRegistry: get(parent.package.info.options, ['mayChangeRegistry'], false),
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
                mayChangeRegistry: get(parent.package.info.options, ['mayChangeRegistry'], false),
                rootName: parent.package.info.options!.rootName,
                rootDirectory: parent.package.info.options!.rootDirectory,
                subPath,
            }
        }
        options.subPath = toUnix(
            normalizeTrim(join(subPath, split.path || packageEntry.path || ''))
        ).replace(/^\.\//, '')
        return {
            internalDefinitionType: InternalDefinitionEntryType.PSSub,
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
                optional: isDefined(packageEntry.optional) ? packageEntry.optional : false,
                settings: packageEntry.settings || {},
            },
        }
    }

    public async getVersions(): Promise<IPackageVersion[]> {
        return [new PSSubPackageVersion(this, this.id)]
    }

    public get info(): PSSubPackageInfo {
        return this.package.info as PSSubPackageInfo
    }
}
