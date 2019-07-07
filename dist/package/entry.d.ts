import { RegistryEntry, RegistryGDPSEntry, RegistryPDGSEntry, RegistryPDPSEntry } from "../types/definitions.v1";
export interface InternalGDGSEntry {
    vendor: string;
    name: string;
    repository: string;
    definition?: string;
}
export declare type InternalGDPSEntry = RegistryGDPSEntry;
export declare type InternalPDGSEntry = RegistryPDGSEntry;
export declare type InternalPDPSEntry = RegistryPDPSEntry;
export declare type InternalEntry = InternalGDGSEntry | InternalGDPSEntry | InternalPDGSEntry | InternalPDPSEntry;
export declare function transformToInternalEntry(entry: RegistryEntry): InternalEntry;
