import { RegistryEntry, RegistryGDGSEntry, RegistryGDPSEntry, RegistryPDGSEntry, RegistryPDPSEntry } from './definitions.v1';
export declare type RegistryEntry = RegistryGDGSEntry | RegistryGDPSEntry | RegistryPDGSEntry | RegistryPDPSEntry;
export declare type EntriesSchema = RegistryEntry[];
