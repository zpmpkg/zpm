import { existsSync, readFileSync } from 'fs'
import { safeLoad } from 'js-yaml'
import { merge } from 'lodash'
import path, { normalize } from 'upath'
import { environment } from '~/common/environment'
import { validateSchema, buildSchema } from '~/common/validation'
import { configurationV1 } from '~/schemas/schemas'
import { ConfigurationSchema } from '~/types/configuration.v1'

export class Configuration {
    public values!: Readonly<ConfigurationSchema>
    private names: string[] = ['config.yml', 'config.yaml', 'config.json']
    private loaded: string[] = []

    private validator = buildSchema(configurationV1)

    public load() {
        this.loadOverrideFile(path.join(__dirname, '../../'))
        this.loadOverrideFile(environment.directory.configuration)
    }

    private loadOverrideFile(directory: string) {
        this.names.forEach(n => {
            this.storeFileContent(`${directory}/${n}`)
            this.storeFileContent(`${directory}/.${n}`)
        })
    }

    private storeFileContent(file: string) {
        const abs = normalize(file)
        if (existsSync(file) && !this.loaded.includes(abs)) {
            this.values = merge(this.values || {}, this.loadFile(abs))
            this.loaded.push(abs)

            try {
                this.values = validateSchema(this.values, undefined, {
                    origin: `while loading ${file} - skipping instead`,
                    validator: this.validator,
                })
            } catch (error) {
                // pass
            }
        }
    }

    private loadFile(file: string): ConfigurationSchema {
        const content = readFileSync(file).toString()
        if (file.endsWith('json')) {
            return JSON.parse(content)
        }
        return safeLoad(content)
    }
}
