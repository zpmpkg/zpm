import {
    RegistryEntry,
    RegistryGDGSEntry,
    RegistryGDPSEntry,
    RegistryPDGSEntry,
    RegistryPDPSEntry,
    RegistryPSSubEntry,
} from './definitions.v1'

export type RegistryEntry =
    | RegistryGDGSEntry
    | RegistryGDPSEntry
    | RegistryPDGSEntry
    | RegistryPDPSEntry
    | RegistryPSSubEntry
export type EntriesSchema = RegistryEntry[]
