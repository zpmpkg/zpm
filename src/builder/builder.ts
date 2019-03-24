import { get } from 'lodash'
import { settledPromiseAll } from '~/common/async'
import { isDefined } from '~/common/util'
import { Package } from '~/registry/package'
import { Registries } from '~/registry/registries'
import { LockfileSchema } from '~/types/lockfile.v1'
import { PackageBuilder, PackageType } from './packageBuilder'

export class Builder {
    public registries: Registries
    public root: Package
    public lockFile: LockfileSchema
    public types: string[]
    public builderTypes: string[]
    public builders: PackageBuilder[] = []
    public map: { [k: string]: PackageBuilder } = {}
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
            console.log(type)
            await this.createBuilders(type)
        }
        for (const type of this.types) {
            console.log(type)
            //await this.createBuilders(type)
        }
    }

    public async build() {
        await Promise.all(
            this.builders.map(async builder => {
                await builder.extract()
            })
        )
    }

    private async createBuilders(type: string) {
        await settledPromiseAll(
            (this.lockFile.git[type] || []).map(async pkg => {
                const found: Package = this.registries.searchPackage(type, {
                    name: pkg.name,
                })
                if (isDefined(found)) {
                    const builder = new PackageBuilder(this, found, pkg, {
                        type: PackageType.GIT,
                    })
                    this.map[pkg.id] = builder
                } else {
                    // @todo not implemented
                }
            })
        )
    }

    private async createBuilders2(type: string) {
        // await Promise.all([this.builders.push()])
        await settledPromiseAll(
            (this.lockFile.git[type] || []).map(async pkg => {
                const found: Package = this.registries.searchPackage(type, {
                    name: pkg.name,
                })
                if (isDefined(found)) {
                    const builder = new PackageBuilder(this, found, pkg, {
                        type: PackageType.GIT,
                    })
                    this.builders.push(builder)
                    this.map[pkg.id] = builder
                } else {
                    // @todo not implemented
                }
            })
        )
        // await settledPromiseAll(
        //     (this.lockFile.path[type] || []).map(async pkg => {
        //         if (pkg.name === '$ROOT') {
        //             // this.builders.push(new RootBuilder())
        //         } else {
        //             const root: Package = this.registries.searchPackage(type, {
        //                 name: pkg.name,
        //             })
        //             if (isDefined(root)) {
        //                 // this.builders.push(new PathBuilder())
        //             } else {
        //                 // @todo not implemented
        //             }
        //         }
        //     })
        // )
    }
}
