import { VersionRange } from "../common/range";
import { Manifest } from "../registry/package";
import { RegistryEntry } from "../types/definitions.v1";
import { PackageEntry, PackageSettings } from "../types/package.v1";
import { GSSubPackageOptions, InternalDefinitionEntryType, PackageInfoOptions, PackageVersion, PDPSPackageOptions, PSSubPackageOptions } from './internal';
import { PackageInfo } from './info';
export interface InternalGDGSEntry {
    vendor: string;
    name: string;
    repository: string;
    definition?: string;
}
export interface InternalGDPSEntry {
    definition: string;
    path: string;
}
export interface InternalPDGSEntry {
    vendor?: string;
    name: string;
    repository: string;
    definition: string;
}
export interface InternalPDPSEntry {
}
export interface InternalPSSubEntry {
    name: string;
    path: string;
}
export interface InternalGSSubEntry {
    vendor?: string;
    name: string;
    path: string;
    repository: string;
}
export declare type InternalEntry = InternalGDGSEntry | InternalGDPSEntry | InternalPDGSEntry | InternalPDPSEntry | InternalPSSubEntry | InternalGSSubEntry;
export declare const enum InternalEntryType {
    GDGS = "GDGS",
    GDPS = "GDPS",
    PDGS = "PDGS",
    PDPS = "PDPS",
    PSSub = "PSSub",
    GSSub = "GSSub"
}
export declare function transformToInternalEntry(entry: RegistryEntry): InternalEntry;
export interface InternalDefinitionGDGSEntry {
    internalDefinitionType: InternalDefinitionEntryType;
    entry: {
        vendor?: string;
        name: string;
        repository?: string;
        definition?: string;
    };
    type: string;
    options?: PackageInfoOptions;
    usage: {
        version: VersionRange;
        optional: boolean;
        settings: PackageSettings;
    };
}
export interface InternalDefinitionGDPSEntry {
    internalDefinitionType: InternalDefinitionEntryType;
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
    internalDefinitionType: InternalDefinitionEntryType;
    entry: {
        vendor?: string;
        name: string;
        definition: string;
        repository?: string;
    };
    type: string;
    options?: PackageInfoOptions;
    usage: {
        version: VersionRange;
        optional: boolean;
        settings: PackageSettings;
    };
}
export interface InternalDefinitionPDPSEntry {
    internalDefinitionType: InternalDefinitionEntryType;
    entry: {};
    type: string;
    options?: PDPSPackageOptions;
    usage: {
        optional: boolean;
        settings: PackageSettings;
    };
}
export interface InternalDefinitionGSSubEntry {
    internalDefinitionType: InternalDefinitionEntryType;
    root: {
        version: string;
        vendor?: string;
        name: string;
    };
    entry: {
        path: string;
        repository: string;
    };
    type: string;
    options?: GSSubPackageOptions;
    usage: {
        optional: boolean;
        settings: PackageSettings;
    };
}
export interface InternalDefinitionPSSubEntry {
    internalDefinitionType: InternalDefinitionEntryType;
    root: {
        vendor?: string;
        name: string;
    };
    entry: {
        path: string;
    };
    type: string;
    options?: PSSubPackageOptions;
    usage: {
        optional: boolean;
        settings: PackageSettings;
    };
}
export declare type InternalDefinitionEntry = InternalDefinitionGDGSEntry | InternalDefinitionGDPSEntry | InternalDefinitionPDGSEntry | InternalDefinitionPDPSEntry | InternalDefinitionGSSubEntry | InternalDefinitionPSSubEntry;
export declare function getInternalDefinitionEntryType(entry: PackageEntry): InternalDefinitionEntryType;
export declare function internalDefinitionSubToInternalEntry(definition: InternalDefinitionEntry): InternalPSSubEntry;
export declare function overrideInternalDefinitionToInternalEntry(definition: InternalDefinitionEntry, overriding?: PackageInfo): InternalPDGSEntry;
export declare function overrideInternalDefinitionOptions<T extends PackageInfoOptions>(coptions: T, definition: InternalDefinitionEntry, addedBy: PackageInfo): PackageInfoOptions;
export declare function getInternalEntryType(entry: PackageEntry): InternalEntryType;
export declare function splitVendorName(vendorName: string): {
    vendor?: string;
    name: string;
};
export declare function splitVendorNameWithPath(vendorName: string): {
    vendor?: string;
    name: string;
    path?: string;
    fullName?: string;
};
export declare function transformToInternalDefinitionEntry(entry: PackageEntry, manifest: Manifest, type: string, parent: PackageVersion): InternalDefinitionEntry[];
