import ajv = require('ajv')
import * as fs from 'fs-extra'
import { has } from 'lodash'
import { join } from 'upath'
import { environment } from '~/common/environment'
import { loadJsonOrYaml } from '~/common/io'
import { logger } from '~/common/logger'
import { buildSchema, validateSchema } from '~/common/validation'
import { Package, PackageOptions } from '~/registry/package'
import { isGitEntry, isPathEntry, isNamedPathPackageEntry } from '~/resolver/source/factory'
import { entriesV1 } from '~/schemas/schemas'
import { ManifestOptions, RegistryEntry } from '~/types/definitions.v1'
import { EntriesSchema } from '~/types/entries.v1'
import { Registries } from './registries'

export class Manifest {
    public type: string
    public registries: Registries
    public entries: { [name: string]: Package } = {}
    public options: ManifestOptions
    public packageValidator?: ajv.ValidateFunction
    private validator = buildSchema(entriesV1)

    constructor(registries: Registries, type: string, options: ManifestOptions = {}) {
        this.registries = registries
        this.type = type
        this.options = options
    }

    public async load() {
        if (this.options.schema) {
            this.packageValidator = buildSchema(await this.loadFile(this.options.schema))
        }

        await Promise.all(
            this.registries.registries.map(async registry => {
                const file = join(registry.directory, `${this.type}.json`)
                if (await fs.pathExists(file)) {
                    const contents: EntriesSchema = await this.loadFile(file)
                    try {
                        validateSchema(contents, undefined, {
                            origin: `${file}`,
                            validator: this.validator,
                        })
                        await Promise.all(
                            contents.map(async (x: RegistryEntry) => {
                                // do not allow overriding of packages
                                let name!: string
                                if (isGitEntry(x)) {
                                    name = x.name
                                } else if (isPathEntry(x)) {
                                    name = registry.name ? `${registry.name}:x.path` : x.path
                                } else {
                                    // this one should not validate
                                }
                                if (!has(this.entries, name)) {
                                    this.entries[name] = new Package(this, x)
                                }
                            })
                        )
                    } catch (e) {
                        logger.error(e)
                    }
                }
            })
        )
        await this.add({ name: 'ZPM', path: environment.directory.zpm }, { forceName: true }).load()
    }

    public add(entry: RegistryEntry & { name?: string }, options?: PackageOptions): Package {
        let name: string
        if (isGitEntry(entry)) {
            name = entry.name
        } else if (isNamedPathPackageEntry(entry)) {
            name = `${entry.name}:${entry.path}`
        } else if (isPathEntry(entry)) {
            if (!options || !options.forceName) {
                entry.name =
                    options && options.rootHash ? `${options!.rootHash}:${entry.path}` : entry.path
            }
            name = entry.name!
        } else {
            throw new Error('Failed to determine package type')
        }

        if (!has(this.entries, name)) {
            this.entries[name] = new Package(this, entry, options)
        }

        return this.entries[name]
    }

    private async loadFile(file: string): Promise<EntriesSchema> {
        return loadJsonOrYaml(file)
    }
}
