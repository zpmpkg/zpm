import { PackageBuilder } from './packageBuilder'

export class PathBuilder extends PackageBuilder {
    public async extract(): Promise<boolean> {
        return true
    }
}
