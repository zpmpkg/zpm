import {
    RegistryEntry,
    RegistryGDGSEntry,
    RegistryGDPSEntry,
    RegistryGDSubGSEntry,
    RegistryPDGSEntry,
    RegistryPDPSEntry,
    RegistryPSSubEntry,
} from './definitions.v1'

export type RegistryEntry =
    | RegistryGDGSEntry
    | RegistryGDSubGSEntry
    | RegistryGDPSEntry
    | RegistryPDGSEntry
    | RegistryPDPSEntry
    | RegistryPSSubEntry
export type EntriesSchema = RegistryEntry[]
