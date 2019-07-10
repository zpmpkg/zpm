import { RegistryEntry, RegistryGDGSEntry, RegistryGDPSEntry, RegistryPDGSEntry, RegistryPDPSEntry, RegistryPSSubEntry } from './definitions.v1';
export declare type RegistryEntry = RegistryGDGSEntry | RegistryGDPSEntry | RegistryPDGSEntry | RegistryPDPSEntry | RegistryPSSubEntry;
export declare type EntriesSchema = RegistryEntry[];
