import { ManifestOptions, RegistryDefinition } from './definitions.v1'

export interface ConfigurationSchema {
    registries: RegistryDefinition[]
    registry: Array<{
        name: string
        options?: ManifestOptions
    }>
    [k: string]: any
}
