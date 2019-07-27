import { isDefined } from '@zefiros/axioms'
import { logger } from '~/common/logger'
import { Version } from '~/common/version'
import { PackageDefinitionSummary } from '~/resolver/definition/definition'
import { getPathPackageDefinition } from '~/resolver/definition/path'
import {
    InternalDefinitionPDPSEntry,
    IPackage,
    IPackageVersion,
    PackageVersion,
    ParentUsage,
    PDPSPackageInfo,
} from './internal'

export class PDPSPackageVersion extends IPackageVersion {
    public async getDefinition(parent: PackageVersion): Promise<PackageDefinitionSummary> {
        logger.logfile.info(
            `Trying to read '${this.package.info.options!.rootDirectory}' from '${
                this.package.info.directories.definition
            }`
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

    public get package(): PDPSPackage {
        return this._package as PDPSPackage
    }

    public addUsage(usage: ParentUsage): boolean {
        const entry = usage.entry as InternalDefinitionPDPSEntry

        if (!isDefined(this.version.usedBy[usage.addedBy.id])) {
            this.version.usedBy[usage.addedBy.id] = {
                settings: entry.usage.settings,
                optional: isDefined(entry.usage.optional) ? entry.usage.optional : false,
            }
        }
        return true
    }
}

export class PDPSPackage extends IPackage {
    public async getVersions(): Promise<IPackageVersion[]> {
        return [new PDPSPackageVersion(this, this.id)]
    }

    public get info(): PDPSPackageInfo {
        return this.package.info as PDPSPackageInfo
    }
}
