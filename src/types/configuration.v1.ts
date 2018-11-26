import { Registry } from './definitions.v1'

export interface ConfigurationSchema {
    registries: Registry[]
    registry?: any
    [k: string]: any
}
