import { filter, flatten } from 'lodash'
import { isDefined } from '~/common/util'
import { Manifest } from '~/registry/manifest'
import { ConfigurationSchema } from '~/types/configuration.v1'
import { RegistryDefinition, RegistryEntry } from '~/types/definitions.v1'
import { ZPM } from '../zpm'
import { PackageOptions } from './package'
import { Registry } from './registry'

export class Registries {
    public zpm: ZPM
    public registries!: Registry[]

    public config!: ConfigurationSchema
    public manifests: { [k: string]: Manifest } = {}

    constructor(zpm: ZPM) {
        this.zpm = zpm
    }

    public async load() {
        await this.findRegistries()
        await this.loadManifests()
    }

    public addPackage(type: string, entry: RegistryEntry, options?: PackageOptions) {
        return this.manifests[type].add(entry, options)
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
        const newRegistries: RegistryDefinition[] = flatten(
            filter(
                await Promise.all(registries.map(async registry => registry.update())),
                isDefined
            )
        )
        // go one deeper in the registry chain (each registry may also host a registry list)
        newRegistries.forEach(r => {
            registries.push(new Registry(r.url, r.branch))
        })
        await Promise.all(
            registries.map(async registry => {
                await registry.update()
            })
        )

        this.registries = registries.filter(x => x.valid)
    }
}
