import { PackageBuilder } from './packageBuilder'

export class RootBuilder extends PackageBuilder {
    public async extract(): Promise<boolean> {
        return true
    }
}
