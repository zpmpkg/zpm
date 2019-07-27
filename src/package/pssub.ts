import { isDefined } from '@zefiros/axioms'
import { logger } from '~/common/logger'
import { Version } from '~/common/version'
import { PackageDefinitionSummary } from '~/resolver/definition/definition'
import { getPathPackageDefinition } from '~/resolver/definition/path'
import {
    InternalDefinitionPSSubEntry,
    IPackage,
    IPackageVersion,
    PackageVersion,
    ParentUsage,
    PSSubPackageInfo,
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
    public async getVersions(): Promise<IPackageVersion[]> {
        return [new PSSubPackageVersion(this, this.id)]
    }

    public get info(): PSSubPackageInfo {
        return this.package.info as PSSubPackageInfo
    }
}
