import { Package } from '~/registry/package'
import { PackageBuilder } from './packageBuilder'

export class GitBuilder extends PackageBuilder {
    public package: Package
    public hash: string
    public constructor(pkg: Package, hash: string) {
        super()
        this.package = pkg
        this.hash = hash
    }

    public async extract(): Promise<boolean> {
        await this.package.extract(this.hash)
        return true
    }
}
