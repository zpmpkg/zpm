import * as Parallel from 'async-parallel'
import { Manifest } from '~/registry/manifest'
import { ConfigurationSchema } from '~/types/configuration.v1'
import { ZPM } from '../zpm'
import { Registry } from './registry'

export class Registries {
    public zpm: ZPM
    public registries: Registry[]
    public config: ConfigurationSchema
    public manifests: { [k: string]: Manifest } = {}

    constructor(zpm: ZPM) {
        this.zpm = zpm
    }

    public async load() {
        await this.findRegistries()
        await this.loadManifests()
    }

    private async loadManifests() {
        this.manifests.libraries = new Manifest(this, 'libraries')

        await this.manifests.libraries.load()
    }

    private async findRegistries() {
        const registries: Registry[] = [
            ...this.zpm.config.values.registries.map(
                registry => new Registry(registry.url, registry.branch)
            ),
            new Registry(process.cwd()),
        ]
        await Parallel.each(registries, async registry => {
            await registry.pull()
        })
        this.registries = registries.filter(x => x.valid)
    }
}
