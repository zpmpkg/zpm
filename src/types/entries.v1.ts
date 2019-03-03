import { RegistryEntry, RegistryGitEntry, RegistryPathEntry } from './definitions.v1'

export type RegistryEntry = RegistryGitEntry | RegistryPathEntry
export type EntriesSchema = RegistryEntry[]
