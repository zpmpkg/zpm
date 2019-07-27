import { isDefined } from '@zefiros/axioms'
import { logger } from '~/common/logger'
import { Version } from '~/common/version'
import { PackageDefinitionSummary } from '~/resolver/definition/definition'
import { getPathPackageDefinition } from '~/resolver/definition/path'
import {
    IPackage,
    IPackageVersion,
    PackageVersion,
    ParentUsage,
    PSSubPackageInfo,
    InternalDefinitionGSSubEntry,
    GSSubPackageInfo,
} from './internal'
import { createRepository } from './repository'
import { join } from 'upath'
import { environment } from '~/common/environment'

export class GSSubPackageVersion extends IPackageVersion {
    public async getDefinition(parent: PackageVersion): Promise<PackageDefinitionSummary> {
        logger.logfile.info(
            `Trying to read '${this.package.info.entry.path}' from '${
                this.package.info.directories.definition
            }`
        )
        return getPathPackageDefinition(this.package, parent)
    }

    public getCost(): number {
        return Version.versionInverse - Version.majorVersionCost
    }

    public getTargetPath(): string | undefined {
        return this.getBuildPath()
    }

    public getBuildPath(): string {
        return join(
            environment.directory.extract,
            this.package.info.manifest,
            this.package.info.entry.vendor,
            this.package.info.entry.name
        )
    }

    public get package(): GSSubPackage {
        return this._package as GSSubPackage
    }

    public addUsage(usage: ParentUsage): boolean {
        const entry = usage.entry as InternalDefinitionGSSubEntry

        if (!isDefined(this.version.usedBy[usage.addedBy.id])) {
            this.version.usedBy[usage.addedBy.id] = {
                settings: entry.usage.settings,
                optional: isDefined(entry.usage.optional) ? entry.usage.optional : false,
            }
        }
        return true
    }
}

export class GSSubPackage extends IPackage {
    public async load(): Promise<boolean> {
        await createRepository(
            this.info.directories.source,
            this.info.entry.repository
        ).cloneOrFetch(`repository '${this.info.name}'`)
        return true
    }

    public async getVersions(): Promise<IPackageVersion[]> {
        return [new GSSubPackageVersion(this, this.id)]
    }

    public get info(): GSSubPackageInfo {
        return this.package.info as GSSubPackageInfo
    }
}
