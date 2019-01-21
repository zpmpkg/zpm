import { get, keys, uniq } from 'lodash'
import { logger } from '~/common/logger'
import { isDefined } from '~/common/util'
import { Package } from '~/registry/package'
import { Registries } from '~/registry/registries'
import { SATSolution } from '~/solver/solution'
import { GitBuilder } from './gitBuilder'
import { PackageBuilder } from './packageBuilder'

export class Builder {
    public registries: Registries
    public root: Package
    public lockFile: SATSolution
    public types: string[]
    public builders: PackageBuilder[] = []

    constructor(registries: Registries, root: Package, lockFile: SATSolution) {
        this.registries = registries
        this.root = root
        this.lockFile = lockFile

        this.types = uniq([...keys(get(this.lockFile, 'git')), ...keys(get(this.lockFile, 'path'))])

        logger.info(lockFile)
    }

    public async load() {
        for (const type of this.types) {
            await Promise.all(
                this.lockFile.git[type].map(async pkg => {
                    const found: Package = get(this.registries.manifests, [
                        type,
                        'entries',
                        pkg.name,
                    ])
                    if (isDefined(found)) {
                        this.builders.push(new GitBuilder(found, pkg.hash))
                    } else {
                        // @todo not implemented
                    }
                })
            )
        }
    }

    public async extract() {
        await Promise.all(this.builders.map(async builder => builder.extract()))
    }
}
