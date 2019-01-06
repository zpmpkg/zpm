import { get, keys, uniq } from 'lodash'
import { isDefined } from '~/common/util'
import { Package } from '~/registry/package'
import { Registries } from '~/registry/registries'
import { SATSolution } from '~/solver/solution'

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
            for (const pkg of this.lockFile.git.libraries) {
                const found: Package = get(this.registries.manifests, [type, 'entries', pkg.name])
                if (isDefined(found)) {
                    await found.extract(pkg.hash)
                }
            }
        }
    }
}
