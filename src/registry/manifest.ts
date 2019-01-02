import * as fs from 'fs-extra'
import { has } from 'lodash'
import { join, normalize } from 'upath'
import { loadJsonOrYaml } from '~/common/io'
import { logger } from '~/common/logger'
import { validateSchema, buildSchema } from '~/common/validation'
import { Package, PackageOptions } from '~/registry/package'
import { isGitEntry, isPathEntry } from '~/resolver/source/factory'
import { entriesV1 } from '~/schemas/schemas'
import { RegistryEntry } from '~/types/definitions.v1'
import { EntriesSchema } from '~/types/entries.v1'
import { Registries } from './registries'

export class Manifest {
    public type: string
    public registries: Registries
    public entries: { [name: string]: Package } = {}
    private validator = buildSchema(entriesV1)

    constructor(registries: Registries, type: string) {
        this.registries = registries
        this.type = type
    }

    public async load() {
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
                                    name = x.path
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
        try {
            // await this.entries['Zefiros-Software/Boost'].load()
            // await this.entries['Zefiros-Software/GoogleTest'].load()
            // await this.entries['Zefiros-Software/The-Forge'].load()
            // await this.entries['Zefiros-Software/The-Forge'].extract('wef')
        } catch (e) {
            logger.error(e)
        }
    }

    public add(entry: RegistryEntry, options?: PackageOptions): Package {
        let name: string
        if (isGitEntry(entry)) {
            name = entry.name
        } else if (isPathEntry(entry)) {
            entry.path = normalize(entry.path)
            name = entry.path
        } else {
            throw new Error('Failed to determine package type')
        }
        this.entries[name] = new Package(this, entry, options)

        return this.entries[name]
    }

    private async loadFile(file: string): Promise<EntriesSchema> {
        return loadJsonOrYaml(file)
    }
}
