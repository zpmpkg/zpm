import { exists } from 'async-file'
import * as Parallel from 'async-parallel'
import { join } from 'upath'
import { loadJsonOrYaml } from '~/common/io'
import { logger } from '~/common/logger'
import { validateSchema } from '~/common/validation'
import { Package } from '~/registry/package'
import { entriesV1 } from '~/schemas/schemas'
import { EntriesSchema } from '~/types/entries.v1'
import { Registries } from './registries'

export class Manifest {
    public type: string
    public registries: Registries
    public entries: { [name: string]: Package } = {}

    constructor(registries: Registries, type: string) {
        this.registries = registries
        this.type = type
    }

    public async load() {
        await Parallel.each(this.registries.registries, async registry => {
            const file = join(registry.directory, `${this.type}.json`)
            if (await exists(file)) {
                const contents: EntriesSchema = await this.loadFile(file)
                try {
                    validateSchema(contents, entriesV1)
                    await Parallel.each(contents, async x => {
                        this.entries[x.name] = new Package(this, x)
                    })

                    await this.entries['Zefiros-Software/GoogleTest'].load()
                    await this.entries['Zefiros-Software/The-Forge'].load()
                } catch (e) {
                    logger.error(e)
                }
            }
        })

        await this.entries['Zefiros-Software/The-Forge'].extract('wef')
    }

    private async loadFile(file: string): Promise<EntriesSchema> {
        return loadJsonOrYaml(file)
    }
}
