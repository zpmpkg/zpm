import { RegistryEntry, RegistryNamedEntry, RegistryPathEntry } from './definitions.v1'

export type RegistryEntry = RegistryNamedEntry | RegistryPathEntry
export type EntriesSchema = RegistryEntry[]
