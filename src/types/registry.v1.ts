import {
    RegistryDefinition,
    RegistryGitLocationEntry,
    RegistryPathLocationEntry,
} from './definitions.v1'

export type RegistryDefinition = RegistryGitLocationEntry | RegistryPathLocationEntry
export type RegistrySchema = RegistryDefinition[]
