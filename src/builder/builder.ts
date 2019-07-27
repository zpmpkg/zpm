import { get } from '@zefiros/axioms'
import fs from 'fs-extra'
import { join } from 'upath'
import { settledPromiseAll } from '~/common/async'
import { environment } from '~/common/environment'
import { isDefined } from '~/common/util'
import { PackageVersion } from '~/package/internal'
import { Registries } from '~/registry/registries'
import { LockFile, VersionLock } from '~/types/lockfile.v1'
// tslint:disable-next-line: no-circular-imports
import { TargetCMakeBuilder } from './cmakebuilder'
// tslint:disable-next-line: no-circular-imports
import { TargetExtractor } from './extractor'
// tslint:disable-next-line: no-circular-imports
import { IBuilder, PackageBuilder, TargetBuilder } from './packageBuilder'

export class Builder {
    public registries: Registries
    public lock: LockFile
    public types: string[]
    public builderTypes: string[]
    public versions: Map<string, PackageBuilder> = new Map()
    public builders: Map<string, TargetBuilder[]> = new Map()

    constructor(registries: Registries, lock: LockFile) {
        this.registries = registries
        this.lock = lock

        this.types = registries
            .getRegistries()
            .filter(r => !get(r, ['options', 'isBuildDefinition']))
            .map(r => r.name)

        this.builderTypes = registries
            .getRegistries()
            .filter(r => get(r, ['options', 'isBuildDefinition']))
            .map(r => r.name)
    }

    public load() {
        for (const lock of this.lock.versions) {
            const found = this.registries.getVersion(lock.versionId)
            if (isDefined(found)) {
                const manifest = found.package.info.manifest
                const builder = builderFactory(manifest, this, found, lock)
                if (!this.builderTypes.includes(manifest)) {
                    this.versions.set(found.id, builder as PackageBuilder)
                } else {
                    if (!this.builders.has(manifest)) {
                        this.builders.set(manifest, [])
                    }
                    this.builders.get(manifest)!.push(builder as TargetBuilder)
                }
            } else {
                // @todo not implemented
            }
        }
    }

    public async build() {
        const groupedBuilders = this.builderTypes.map(b => this.builders.get(b) || [])
        for (const builders of groupedBuilders) {
            await settledPromiseAll(builders.map(b => b.initialize()))
        }

        for (const builders of groupedBuilders) {
            await settledPromiseAll(builders.map(b => b.build()))
        }

        // only wrap up when we actually extracted packages
        if (fs.pathExistsSync(environment.directory.extract)) {
            for (const builders of this.builders.values()) {
                for (const builder of builders) {
                    if (builder.used) {
                        await builder.finish()
                    }
                }
            }
            // automatically exlude from git to keep everyone happy :)
            await fs.writeFile(join(environment.directory.extract, '.gitignore'), '*')
        }

        for (const packageBuilder of this.versions.values()) {
            packageBuilder.finish()
        }
    }
}

export function builderFactory(
    type: string,
    builder: Builder,
    version: PackageVersion,
    lock: VersionLock
): IBuilder {
    if (type === 'extractor') {
        return new TargetExtractor(builder, version, lock)
    } else if (type === 'builder') {
        return new TargetCMakeBuilder(builder, version, lock)
    }

    return new PackageBuilder(builder, version, lock)
}
