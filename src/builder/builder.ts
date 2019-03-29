import { flatten, get } from 'lodash'
import { settledPromiseAll } from '~/common/async'
import { isDefined } from '~/common/util'
import { Package } from '~/registry/package'
import { Registries } from '~/registry/registries'
import { GitLock, LockfileSchema, PathLock } from '~/types/lockfile.v1'
import { Extractor } from './extractor'
import { BuilderOptions, PackageBuilder, PackageType } from './packageBuilder'

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
    }

    private async createBuilders(type: string, isPackage: boolean) {
        await settledPromiseAll(
            (this.lockFile.named[type] || []).map(async pkg => {
                const found: Package = this.registries.searchPackage(type, {
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
                if (pkg.name === '$ROOT') {
                    // this.builders.push(new RootBuilder())
                } else {
                    const found: Package = this.registries.searchPackage(type, {
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

    // private async createPackage(type: string) {
    //     // // await Promise.all([this.builders.push()])
    //     await settledPromiseAll(
    //         (this.lockFile.git[type] || []).map(async pkg => {
    //             const found: Package = this.registries.searchPackage(type, {
    //                 name: pkg.name,
    //             })
    //             if (isDefined(found)) {
    //                 const builder = builderFactory(type, this, found, pkg, {
    //                     type: PackageType.GIT,
    //                 })
    //                 this.packages.push(builder)
    //             } else {
    //                 // @todo not implemented
    //             }
    //         })
    //     )
    //     // await settledPromiseAll(
    //     //     (this.lockFile.path[type] || []).map(async pkg => {
    //     //         if (pkg.name === '$ROOT') {
    //     //             // this.builders.push(new RootBuilder())
    //     //         } else {
    //     //             const root: Package = this.registries.searchPackage(type, {
    //     //                 name: pkg.name,
    //     //             })
    //     //             if (isDefined(root)) {
    //     //                 // this.builders.push(new PathBuilder())
    //     //             } else {
    //     //                 // @todo not implemented
    //     //             }
    //     //         }
    //     //     })
    //     // )
    // }
}

export function builderFactory(
    type: string,
    builder: Builder,
    pkg: Package,
    lock: GitLock | PathLock,
    options: Partial<BuilderOptions> = {}
) {
    if (type === 'extractor') {
        return new Extractor(builder, pkg, lock, options)
    }

    return new PackageBuilder(builder, pkg, lock, options)
}
