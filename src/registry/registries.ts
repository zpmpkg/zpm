import { filter, flatten, has } from 'lodash'
import { settledPromiseAll } from '~/common/async'
import { environment } from '~/common/environment'
import { transformPath } from '~/common/io'
import { isDefined } from '~/common/util'
import {
    InternalDefinitionEntry,
    InternalEntry,
    Package,
    PackageInfoOptions,
    PackageTypeToInternalType,
    PackageVersion,
    InternalDefinitionEntryType,
} from '~/package/internal'
import { ConfigurationSchema } from '~/types/configuration.v1'
import {
    RegistryDefinition,
    RegistryNamedLocationEntry,
    RegistryPathLocationEntry,
} from '~/types/definitions.v1'
// tslint:disable-next-line: no-circular-imports
import { ZPM } from '~/zpm'
// tslint:disable-next-line: no-circular-imports
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
    public versions: Map<string, PackageVersion> = new Map()
    private manifests: { [k: string]: Manifest } = {}

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

    // tslint:disable-next-line: no-accessor-field-mismatch
    public getRegistries() {
        return this.zpm.config.values.registry
    }

    public getManifest(type: string) {
        return this.manifests[type]
    }

    public getVersion(id: string): PackageVersion | undefined {
        return this.versions.get(id)
    }

    public addVersion(id: string, version: PackageVersion): boolean {
        if (!this.versions.has(id)) {
            this.versions.set(id, version)
            return true
        }
        return false
    }

    public search(
        entry: InternalDefinitionEntry
    ): { package: Package | undefined; name: string; sameType: boolean } {
        const found = this.manifests[entry.type].search(entry)
        if (found.package) {
            if (
                PackageTypeToInternalType[found.package.info.type] === entry.internalDefinitionType 
                ||
                ((entry.internalDefinitionType === InternalDefinitionEntryType.GDGS || 
                    entry.internalDefinitionType === InternalDefinitionEntryType.GDSubGS) &&

                    (PackageTypeToInternalType[found.package.info.type] === InternalDefinitionEntryType.GDGS ||
                 PackageTypeToInternalType[found.package.info.type] === InternalDefinitionEntryType.GDSubGS))
            ) {
                return { ...found, sameType: true }
            }
            return { ...found, sameType: false }
        }
        return { ...found, sameType: false }
    }

    public searchByName(type: string, name: string) {
        if (type in this.manifests) {
            return this.manifests[type].searchByName(name)
        }
        return undefined
    }

    public addPackage<E extends InternalEntry, O extends PackageInfoOptions>(
        type: string,
        entry: E,
        options?: O,
        force?: boolean
    ) {
        return this.manifests[type].add(entry, options, undefined, force)
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
            // new Registry(environment.directory.zpm, {
            //     workingDirectory: environment.directory.zpm,
            //     name: 'ZPM',
            // }),
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
