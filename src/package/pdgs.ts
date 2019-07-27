import { isDefined } from '@zefiros/axioms'
import { join } from 'upath'
import { environment } from '~/common/environment'
import { logger } from '~/common/logger'
import { shorten } from '~/common/util'
import { PackageDefinitionSummary } from '~/resolver/definition/definition'
import { getPathPackageDefinition } from '~/resolver/definition/path'
import { GitVersion, listGitVersions } from '~/resolver/source/git'
import {
    InternalDefinitionPDGSEntry,
    IPackage,
    IPackageVersion,
    PackageVersion,
    ParentUsage,
    PDGSPackageInfo,
} from './internal'
import { createRepository } from './repository'
import { SourceVersion } from './sourceVersion'

export class PDGSPackageVersion extends IPackageVersion {
    public gitVersion: GitVersion
    public constructor(pkg: IPackage, id: string, gitVersion: GitVersion) {
        super(pkg, `${id}:${gitVersion.name}-${shorten(gitVersion.hash)}`)
        this.gitVersion = gitVersion
    }
    public async getDefinition(parent: PackageVersion): Promise<PackageDefinitionSummary> {
        logger.logfile.info(`Trying to read '${this.package.info.entry.repository}' definition`)
        return getPathPackageDefinition(this.package, parent)
    }

    public getVersion(): SourceVersion | undefined {
        return {
            name: this.gitVersion.name,
            hash: this.gitVersion.hash,
            version: this.gitVersion.version.toString(),
        }
    }

    public getCost(): number {
        return this.gitVersion.version.cost
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

    public get package(): PDGSPackage {
        return this._package as PDGSPackage
    }

    public addUsage(usage: ParentUsage): boolean {
        const entry = usage.entry as InternalDefinitionPDGSEntry

        if (entry.usage.version.satisfies(this.gitVersion.version)) {
            if (!isDefined(this.version.usedBy[usage.addedBy.id])) {
                this.version.usedBy[usage.addedBy.id] = {
                    settings: entry.usage.settings,
                    optional: isDefined(entry.usage.optional) ? entry.usage.optional : false,
                }
            }
            return true
        }
        return false
    }
}

export class PDGSPackage extends IPackage {
    public async load(): Promise<boolean> {
        await createRepository(
            this.info.directories.source,
            this.info.entry.repository
        ).cloneOrFetch(`repository '${this.info.name}'`)

        return true
    }

    public async getVersions(): Promise<IPackageVersion[]> {
        const fversions = await listGitVersions(this.info.directories.source)

        return fversions.map(v => new PDGSPackageVersion(this, this.id, v))
    }

    public get info(): PDGSPackageInfo {
        return this.package.info as PDGSPackageInfo
    }
}
