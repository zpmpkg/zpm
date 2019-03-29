import {
    RegistryDefinition,
    RegistryNamedLocationEntry,
    RegistryPathLocationEntry,
} from './definitions.v1'

export type RegistryDefinition = RegistryNamedLocationEntry | RegistryPathLocationEntry
export type RegistrySchema = RegistryDefinition[]
