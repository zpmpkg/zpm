import { Mutex } from 'async-mutex'
import { filter, flatten, has } from 'lodash'
import { settledPromiseAll } from '~/common/async'
import { environment } from '~/common/environment'
import { transformPath } from '~/common/io'
import { isDefined } from '~/common/util'
import { InternalDefinitionEntry, InternalEntry } from '~/package/entry'
import { PackageInfoOptions } from '~/package/info'
import { Package } from '~/package/package'
import { ConfigurationSchema } from '~/types/configuration.v1'
import {
    RegistryDefinition,
    RegistryNamedLocationEntry,
    RegistryPathLocationEntry,
} from '~/types/definitions.v1'
import { ZPM } from '~/zpm'
import { Manifest } from './package'
import { Registry } from './registry'

export function isPathRegistry(entry: RegistryDefinition): entry is RegistryPathLocationEntry {
    return has(entry, 'path')
}
export function isNamedRegistry(entry: RegistryDefinition): entry is RegistryNamedLocationEntry {
    return has(entry, 'url')
}

export class Registries {
    public zpm: ZPM
    public registries!: Registry[]

    public config!: ConfigurationSchema
    private manifests: { [k: string]: Manifest } = {}
    private addMutex: Mutex = new Mutex()

    constructor(zpm: ZPM) {
        this.zpm = zpm
    }

    public async load() {
        await this.findRegistries()
        await this.loadManifests()
    }

    public getTypes() {
        return this.zpm.config.values.registry.map(r => r.name)
    }

    public getRegistries() {
        return this.zpm.config.values.registry
    }

    public getManifest(type: string) {
        return this.manifests[type]
    }

    public search(entry: InternalDefinitionEntry): { package: Package | undefined; name: string } {
        return this.manifests[entry.type].search(entry)
    }

    public addPackage<E extends InternalEntry, O extends PackageInfoOptions>(
        type: string,
        entry: E,
        options?: O
    ) {
        return this.manifests[type].add(entry, options)
    }

    private async loadManifests() {
        await settledPromiseAll(
            this.zpm.config.values.registry.map(async r => {
                this.manifests[r.name] = new Manifest(this, r.name, r.options)

                await this.manifests[r.name].load()
            })
        )
    }

    private async findRegistries() {
        const registries: Registry[] = [
            ...this.zpm.config.values.registries
                .filter(isNamedRegistry)
                .map(registry => new Registry(registry.url, { branch: registry.branch })),
            ...this.zpm.config.values.registries.filter(isPathRegistry).map(
                registry =>
                    new Registry(transformPath(registry.path), {
                        name: registry.name,
                        workingDirectory: registry.workingDirectory,
                    })
            ),
            new Registry(environment.directory.zpm, {
                workingDirectory: environment.directory.zpm,
                name: 'ZPM',
            }),
            new Registry(environment.directory.workingdir, { name: 'ROOT' }),
        ]
        const newRegistries: RegistryDefinition[] = flatten(
            filter(
                await settledPromiseAll(registries.map(async registry => registry.update())),
                isDefined
            )
        )
        // go one deeper in the registry chain (each registry may also host a registry list)
        newRegistries.filter(isNamedRegistry).forEach(r => {
            registries.push(new Registry(r.url, { branch: r.branch }))
        })
        await settledPromiseAll(
            registries.map(async registry => {
                await registry.update()
            })
        )

        this.registries = registries.filter(x => x.valid)
    }
}
