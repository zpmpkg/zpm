import fs from 'fs-extra'
import { flatten, get } from 'lodash'
import { map } from 'lodash'
import { join } from 'upath'
import { settledPromiseAll } from '~/common/async'
import { environment } from '~/common/environment'
import { isDefined } from '~/common/util'
import { Package } from '~/registry/package'
import { Registries } from '~/registry/registries'
import { LockfileSchema, NamedLock, PathLock } from '~/types/lockfile.v1'
import { BuilderOptions, PackageBuilder, PackageType } from './packageBuilder'
import { TargetBuilder } from './target/builder'
import { TargetExtractor } from './target/extractor'

export class Builder {
    public registries: Registries
    public root: Package
    public lockFile: LockfileSchema
    public types: string[]
    public builderTypes: string[]
    public packages: PackageBuilder[] = []
    public builders: { [k: string]: PackageBuilder } = {}
    public tree: any

    constructor(registries: Registries, root: Package, lockFile: LockfileSchema) {
        this.registries = registries
        this.root = root
        this.lockFile = lockFile

        this.types = registries
            .getRegistries()
            .filter(r => !get(r, 'options.isBuildDefinition'))
            .map(r => r.name)

        this.builderTypes = registries
            .getRegistries()
            .filter(r => get(r, 'options.isBuildDefinition'))
            .map(r => r.name)

        // logger.info(lockFile)
    }

    public async load() {
        for (const type of this.builderTypes) {
            await this.createBuilders(type, false)
        }
        for (const type of this.types) {
            await this.createBuilders(type, true)
        }
    }

    public async build() {
        for await (const builder of this.builderTypes) {
            await settledPromiseAll(
                flatten(
                    this.packages.map(async pkg => {
                        await pkg.build(builder)
                    })
                )
            )
        }
        // only wrap up when we actually extracted packages
        if (await fs.pathExists(environment.directory.extract)) {
            await settledPromiseAll(
                map(this.builders, async builder => {
                    if (builder.used) {
                        await builder.finish()
                    }
                })
            )

            // automatically exlude from git to keep everyone happy :)
            await fs.writeFile(join(environment.directory.extract, '.gitignore'), '*')
        }
    }

    private async createBuilders(type: string, isPackage: boolean) {
        await settledPromiseAll(
            (this.lockFile.named[type] || []).map(async pkg => {
                const found = await this.registries.search(type, {
                    name: pkg.name,
                })
                if (isDefined(found)) {
                    const builder = builderFactory(type, this, found, pkg, {
                        type: PackageType.NAMED,
                    })
                    if (isPackage) {
                        this.packages.push(builder)
                    } else {
                        this.builders[pkg.id] = builder
                    }
                } else {
                    // @todo not implemented
                }
            })
        )
        await settledPromiseAll(
            (this.lockFile.path[type] || []).map(async pkg => {
                if (pkg.name === '$ROOT' && !this.builderTypes.includes(type)) {
                    // this.builders.push(new RootBuilder())
                } else {
                    const found = await this.registries.search(type, {
                        name: pkg.name,
                        path: pkg.path,
                    })
                    if (isDefined(found)) {
                        const builder = builderFactory(type, this, found, pkg, {
                            type: PackageType.PATH,
                        })
                        if (isPackage) {
                            this.packages.push(builder)
                        } else {
                            this.builders[pkg.id] = builder
                        }
                    } else {
                        // @todo not implemented
                    }
                }
            })
        )
    }
}

export function builderFactory(
    type: string,
    builder: Builder,
    pkg: Package,
    lock: NamedLock | PathLock,
    options: Partial<BuilderOptions> = {}
) {
    if (type === 'extractor') {
        return new TargetExtractor(builder, pkg, lock, options)
    } else if (type === 'builder') {
        return new TargetBuilder(builder, pkg, lock, options)
    }

    return new PackageBuilder(builder, pkg, lock, options)
}
