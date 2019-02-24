import {
    RegistryEntry,
    RegistryGitEntry,
    RegistryNamedPathEntry,
    RegistryPathEntry,
} from './definitions.v1'

export type RegistryEntry = RegistryGitEntry | RegistryPathEntry | RegistryNamedPathEntry
export type EntriesSchema = RegistryEntry[]
