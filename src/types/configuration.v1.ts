import { RegistryDefinition } from './definitions.v1'

export interface ConfigurationSchema {
    registries: RegistryDefinition[]
    registry?: any
    [k: string]: any
}
