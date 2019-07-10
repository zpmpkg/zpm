import { RegistryEntry, RegistryGDPSEntry, RegistryPDPSEntry, RegistryPSSubEntry } from "../types/definitions.v1";
import { PackageEntry, PackageSettings } from "../types/package.v1";
import { GSSubPackageOptions, PackageInfoOptions, PDPSPackageOptions } from './info';
export interface InternalGDGSEntry {
    vendor: string;
    name: string;
    repository: string;
    definition?: string;
}
export declare type InternalGDPSEntry = RegistryGDPSEntry;
export interface InternalPDGSEntry {
    vendor: string;
    name: string;
    repository: string;
    definition: string;
}
export declare type InternalPDPSEntry = RegistryPDPSEntry;
export declare type InternalPSSubEntry = RegistryPSSubEntry;
export declare type InternalEntry = InternalGDGSEntry | InternalGDPSEntry | InternalPDGSEntry | InternalPDPSEntry | InternalPSSubEntry;
export declare const enum InternalEntryType {
    GDGS = "GDGS",
    GDPS = "GDPS",
    PDGS = "PDGS",
    PDPS = "PDPS",
    PSSub = "PSSub"
}
export declare function transformToInternalEntry(entry: RegistryEntry): InternalEntry;
export interface InternalDefinitionGDGSEntry {
    internalDefinitionType: InternalDefinitionEntyType;
    entry: {
        vendor?: string;
        name: string;
        repository?: string;
        definition?: string;
    };
    type: string;
    options?: PackageInfoOptions;
    usage: {
        version: string;
        optional: boolean;
        settings: PackageSettings;
    };
}
export interface InternalDefinitionGDPSEntry {
    internalDefinitionType: InternalDefinitionEntyType;
    entry: {
        definition: string;
        path: string;
    };
    type: string;
    options?: PackageInfoOptions;
    usage: {
        optional: boolean;
        settings: PackageSettings;
    };
}
export interface InternalDefinitionPDGSEntry {
    internalDefinitionType: InternalDefinitionEntyType;
    entry: {
        vendor?: string;
        name: string;
        definition: string;
        repository?: string;
    };
    type: string;
    options?: PackageInfoOptions;
    usage: {
        version: string;
        optional?: boolean;
        settings?: PackageSettings;
    };
}
export interface InternalDefinitionPDPSEntry {
    internalDefinitionType: InternalDefinitionEntyType;
    entry: {
        path: string;
    };
    type: string;
    options?: PDPSPackageOptions;
    usage: {
        optional?: boolean;
        settings?: PackageSettings;
    };
}
export interface InternalDefinitionGSSubEntry {
    internalDefinitionType: InternalDefinitionEntyType;
    root: {
        version: string;
        vendor?: string;
        name: string;
    };
    entry: {
        path: string;
    };
    type: string;
    options?: GSSubPackageOptions;
    usage: {
        optional?: boolean;
        settings?: PackageSettings;
    };
}
export interface InternalDefinitionPSSubEntry {
    internalDefinitionType: InternalDefinitionEntyType;
    root: {
        vendor?: string;
        name: string;
    };
    entry: {
        path: string;
    };
    type: string;
    options?: GSSubPackageOptions;
    usage: {
        optional?: boolean;
        settings?: PackageSettings;
    };
}
export declare type InternalDefinitionEntry = InternalDefinitionGDGSEntry | InternalDefinitionGDPSEntry | InternalDefinitionPDGSEntry | InternalDefinitionPDPSEntry | InternalDefinitionGSSubEntry | InternalDefinitionPSSubEntry;
export declare const enum InternalDefinitionEntyType {
    GDGS = "GDGS",
    GDPS = "GDPS",
    PDGS = "PDGS",
    PDPS = "PDPS",
    GSSub = "GSSub",
    PSSub = "PSSub"
}
export interface PackageTypeToInternalDefinitionEntry {
    [InternalDefinitionEntyType.GDGS]: InternalDefinitionGDGSEntry;
    [InternalDefinitionEntyType.PDPS]: InternalDefinitionPDPSEntry;
    [InternalDefinitionEntyType.PDGS]: InternalDefinitionPDGSEntry;
    [InternalDefinitionEntyType.GDPS]: InternalDefinitionGDPSEntry;
    [InternalDefinitionEntyType.GSSub]: InternalDefinitionGSSubEntry;
    [InternalDefinitionEntyType.PSSub]: InternalDefinitionPSSubEntry;
}
export declare const isInternalDefinitionEntry: <K extends InternalDefinitionEntyType>(condition: K) => (entry: Partial<InternalDefinitionGDGSEntry> | Partial<InternalDefinitionGDPSEntry> | Partial<InternalDefinitionPDGSEntry> | Partial<InternalDefinitionPDPSEntry> | Partial<InternalDefinitionGSSubEntry> | Partial<InternalDefinitionPSSubEntry>) => entry is PackageTypeToInternalDefinitionEntry[K];
export declare const isInternalGDGS: (entry: Partial<InternalDefinitionGDGSEntry> | Partial<InternalDefinitionGDPSEntry> | Partial<InternalDefinitionPDGSEntry> | Partial<InternalDefinitionPDPSEntry> | Partial<InternalDefinitionGSSubEntry> | Partial<InternalDefinitionPSSubEntry>) => entry is InternalDefinitionGDGSEntry;
export declare const isInternalPDPS: (entry: Partial<InternalDefinitionGDGSEntry> | Partial<InternalDefinitionGDPSEntry> | Partial<InternalDefinitionPDGSEntry> | Partial<InternalDefinitionPDPSEntry> | Partial<InternalDefinitionGSSubEntry> | Partial<InternalDefinitionPSSubEntry>) => entry is InternalDefinitionPDPSEntry;
export declare const isInternalPDGS: (entry: Partial<InternalDefinitionGDGSEntry> | Partial<InternalDefinitionGDPSEntry> | Partial<InternalDefinitionPDGSEntry> | Partial<InternalDefinitionPDPSEntry> | Partial<InternalDefinitionGSSubEntry> | Partial<InternalDefinitionPSSubEntry>) => entry is InternalDefinitionPDGSEntry;
export declare const isInternalGDPS: (entry: Partial<InternalDefinitionGDGSEntry> | Partial<InternalDefinitionGDPSEntry> | Partial<InternalDefinitionPDGSEntry> | Partial<InternalDefinitionPDPSEntry> | Partial<InternalDefinitionGSSubEntry> | Partial<InternalDefinitionPSSubEntry>) => entry is InternalDefinitionGDPSEntry;
export declare const isInternalGSSub: (entry: Partial<InternalDefinitionGDGSEntry> | Partial<InternalDefinitionGDPSEntry> | Partial<InternalDefinitionPDGSEntry> | Partial<InternalDefinitionPDPSEntry> | Partial<InternalDefinitionGSSubEntry> | Partial<InternalDefinitionPSSubEntry>) => entry is InternalDefinitionGSSubEntry;
export declare const isInternalPSSub: (entry: Partial<InternalDefinitionGDGSEntry> | Partial<InternalDefinitionGDPSEntry> | Partial<InternalDefinitionPDGSEntry> | Partial<InternalDefinitionPDPSEntry> | Partial<InternalDefinitionGSSubEntry> | Partial<InternalDefinitionPSSubEntry>) => entry is InternalDefinitionPSSubEntry;
export declare function getInternalDefinitionEntryType(entry: PackageEntry): InternalDefinitionEntyType;
export declare function getInternalEntryType(entry: PackageEntry): InternalEntryType;
export declare function splitVendorName(vendorName: string): {
    vendor?: string;
    name: string;
};
export declare function splitVendorNameWithPath(vendorName: string): {
    vendor?: string;
    name: string;
    path?: string;
};
export declare function transformToInternalDefinitionEntry(entry: PackageEntry, type: string): InternalDefinitionEntry;
