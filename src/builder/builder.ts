import { get, keys, uniq } from 'lodash'
import { logger } from '~/common/logger'
import { isDefined } from '~/common/util'
import { Package } from '~/registry/package'
import { Registries } from '~/registry/registries'
import { LockfileSchema } from '~/types/lockfile.v1'
import { GitBuilder } from './gitBuilder'
import { PackageBuilder } from './packageBuilder'
import { PathBuilder } from './pathBuilder'
import { RootBuilder } from './rootBuilder'

export class Builder {
    public registries: Registries
    public root: Package
    public lockFile: LockfileSchema
    public types: string[]
    public builders: PackageBuilder[] = []
    public tree: any

    constructor(registries: Registries, root: Package, lockFile: LockfileSchema) {
        this.registries = registries
        this.root = root
        this.lockFile = lockFile

        this.types = uniq([...keys(get(this.lockFile, 'git')), ...keys(get(this.lockFile, 'path'))])

        logger.info(lockFile)
    }

    public async load() {
        for (const type of this.types) {
            await this.createBuilders(type)
        }
    }

    public async extract() {
        await Promise.all(this.builders.map(async builder => builder.extract()))
    }

    private async createBuilders(type: string) {
        await Promise.all(
            this.lockFile.git[type].map(async pkg => {
                const found: Package = this.registries.searchPackage(type, {
                    name: pkg.name,
                })
                if (isDefined(found)) {
                    this.builders.push(new GitBuilder(found, pkg.hash))
                } else {
                    // @todo not implemented
                }
            })
        )
        await Promise.all(
            this.lockFile.path[type].map(async pkg => {
                if (pkg.root === '$ROOT') {
                    this.builders.push(new RootBuilder())
                } else {
                    const root: Package = this.registries.searchPackage(type, {
                        name: pkg.root,
                    })
                    if (isDefined(root)) {
                        this.builders.push(new PathBuilder())
                    } else {
                        // @todo not implemented
                    }
                }
            })
        )
    }
}
