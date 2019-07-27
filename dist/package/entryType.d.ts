import { InternalDefinitionGDGSEntry, InternalDefinitionGDPSEntry, InternalDefinitionGSSubEntry, InternalDefinitionPDGSEntry, InternalDefinitionPDPSEntry, InternalDefinitionPSSubEntry } from './internal';
import { PackageType } from './type';
export declare const enum InternalDefinitionEntryType {
    GDGS = "GDGS",
    GDPS = "GDPS",
    PDGS = "PDGS",
    PDPS = "PDPS",
    GSSub = "GSSub",
    PSSub = "PSSub"
}
export interface PackageTypeToInternalDefinitionEntry {
    [InternalDefinitionEntryType.GDGS]: InternalDefinitionGDGSEntry;
    [InternalDefinitionEntryType.PDPS]: InternalDefinitionPDPSEntry;
    [InternalDefinitionEntryType.PDGS]: InternalDefinitionPDGSEntry;
    [InternalDefinitionEntryType.GDPS]: InternalDefinitionGDPSEntry;
    [InternalDefinitionEntryType.GSSub]: InternalDefinitionGSSubEntry;
    [InternalDefinitionEntryType.PSSub]: InternalDefinitionPSSubEntry;
}
export declare const PackageTypeToInternalType: {
    [PackageType.GDGS]: InternalDefinitionEntryType;
    [PackageType.PDPS]: InternalDefinitionEntryType;
    [PackageType.PDGS]: InternalDefinitionEntryType;
    [PackageType.GDPS]: InternalDefinitionEntryType;
    [PackageType.GSSub]: InternalDefinitionEntryType;
    [PackageType.PSSub]: InternalDefinitionEntryType;
};
export declare const isInternalDefinitionEntry: <K extends InternalDefinitionEntryType>(condition: K) => (entry: Partial<InternalDefinitionGDGSEntry> | Partial<InternalDefinitionGDPSEntry> | Partial<InternalDefinitionPDGSEntry> | Partial<InternalDefinitionPDPSEntry> | Partial<InternalDefinitionGSSubEntry> | Partial<InternalDefinitionPSSubEntry>) => entry is PackageTypeToInternalDefinitionEntry[K];
export declare const isInternalGDGS: (entry: Partial<InternalDefinitionGDGSEntry> | Partial<InternalDefinitionGDPSEntry> | Partial<InternalDefinitionPDGSEntry> | Partial<InternalDefinitionPDPSEntry> | Partial<InternalDefinitionGSSubEntry> | Partial<InternalDefinitionPSSubEntry>) => entry is InternalDefinitionGDGSEntry;
export declare const isInternalPDPS: (entry: Partial<InternalDefinitionGDGSEntry> | Partial<InternalDefinitionGDPSEntry> | Partial<InternalDefinitionPDGSEntry> | Partial<InternalDefinitionPDPSEntry> | Partial<InternalDefinitionGSSubEntry> | Partial<InternalDefinitionPSSubEntry>) => entry is InternalDefinitionPDPSEntry;
export declare const isInternalPDGS: (entry: Partial<InternalDefinitionGDGSEntry> | Partial<InternalDefinitionGDPSEntry> | Partial<InternalDefinitionPDGSEntry> | Partial<InternalDefinitionPDPSEntry> | Partial<InternalDefinitionGSSubEntry> | Partial<InternalDefinitionPSSubEntry>) => entry is InternalDefinitionPDGSEntry;
export declare const isInternalGDPS: (entry: Partial<InternalDefinitionGDGSEntry> | Partial<InternalDefinitionGDPSEntry> | Partial<InternalDefinitionPDGSEntry> | Partial<InternalDefinitionPDPSEntry> | Partial<InternalDefinitionGSSubEntry> | Partial<InternalDefinitionPSSubEntry>) => entry is InternalDefinitionGDPSEntry;
export declare const isInternalGSSub: (entry: Partial<InternalDefinitionGDGSEntry> | Partial<InternalDefinitionGDPSEntry> | Partial<InternalDefinitionPDGSEntry> | Partial<InternalDefinitionPDPSEntry> | Partial<InternalDefinitionGSSubEntry> | Partial<InternalDefinitionPSSubEntry>) => entry is InternalDefinitionGSSubEntry;
export declare const isInternalPSSub: (entry: Partial<InternalDefinitionGDGSEntry> | Partial<InternalDefinitionGDPSEntry> | Partial<InternalDefinitionPDGSEntry> | Partial<InternalDefinitionPDPSEntry> | Partial<InternalDefinitionGSSubEntry> | Partial<InternalDefinitionPSSubEntry>) => entry is InternalDefinitionPSSubEntry;
