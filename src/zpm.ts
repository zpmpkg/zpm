import { Configuration } from '~/common/config'
import { loadEnvironment } from '~/common/environment'
import { Registries } from '~/registry/registries'
import { loadCLI } from './cli/program'

export class ZPM {
    public config = new Configuration()
    public registries: Registries = new Registries(this)

    public async load() {
        loadCLI()
        await loadEnvironment()

        this.config.load()
        await this.registries.load()
    }
}
