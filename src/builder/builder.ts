import { get, keys, uniq } from 'lodash'
import { isDefined } from '~/common/util'
import { Package } from '~/registry/package'
import { Registries } from '~/registry/registries'
import { SATSolution } from '~/solver/solution'
import { logger } from '~/common/logger'

export class Builder {
    public registries: Registries
    public root: Package
    public lockFile: SATSolution
    constructor(registries: Registries, root: Package, lockFile: SATSolution) {
        this.registries = registries
        this.root = root
        this.lockFile = lockFile
    }

    public async load() {
        const types: string[] = uniq([
            ...keys(get(this.lockFile, 'git')),
            ...keys(get(this.lockFile, 'path')),
        ])
        for (const type of types) {
            await Promise.all(
                this.lockFile.git.libraries.map(async pkg => {
                    const found: Package = get(this.registries.manifests, [
                        type,
                        'entries',
                        pkg.name,
                    ])
                    if (isDefined(found)) {
                        await found.extract(pkg.hash)
                    }
                })
            )
        }
    }
}
