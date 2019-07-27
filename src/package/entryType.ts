import {
    InternalDefinitionEntry,
    InternalDefinitionGDGSEntry,
    InternalDefinitionGDPSEntry,
    InternalDefinitionGSSubEntry,
    InternalDefinitionPDGSEntry,
    InternalDefinitionPDPSEntry,
    InternalDefinitionPSSubEntry,
} from './internal'
import { PackageType } from './type'

export const enum InternalDefinitionEntryType {
    GDGS = 'GDGS',
    GDPS = 'GDPS',
    PDGS = 'PDGS',
    PDPS = 'PDPS',
    GSSub = 'GSSub',
    PSSub = 'PSSub',
}

export interface PackageTypeToInternalDefinitionEntry {
    [InternalDefinitionEntryType.GDGS]: InternalDefinitionGDGSEntry
    [InternalDefinitionEntryType.PDPS]: InternalDefinitionPDPSEntry
    [InternalDefinitionEntryType.PDGS]: InternalDefinitionPDGSEntry
    [InternalDefinitionEntryType.GDPS]: InternalDefinitionGDPSEntry
    [InternalDefinitionEntryType.GSSub]: InternalDefinitionGSSubEntry
    [InternalDefinitionEntryType.PSSub]: InternalDefinitionPSSubEntry
}

export const PackageTypeToInternalType = {
    [PackageType.GDGS]: InternalDefinitionEntryType.GDGS,
    [PackageType.PDPS]: InternalDefinitionEntryType.PDPS,
    [PackageType.PDGS]: InternalDefinitionEntryType.PDGS,
    [PackageType.GDPS]: InternalDefinitionEntryType.GDPS,
    [PackageType.GSSub]: InternalDefinitionEntryType.GSSub,
    [PackageType.PSSub]: InternalDefinitionEntryType.PSSub,
}
export const isInternalDefinitionEntry = <K extends InternalDefinitionEntryType>(condition: K) => (
    entry: Partial<InternalDefinitionEntry>
): entry is PackageTypeToInternalDefinitionEntry[K] => entry.internalDefinitionType === condition
export const isInternalGDGS = isInternalDefinitionEntry(InternalDefinitionEntryType.GDGS)
export const isInternalPDPS = isInternalDefinitionEntry(InternalDefinitionEntryType.PDPS)
export const isInternalPDGS = isInternalDefinitionEntry(InternalDefinitionEntryType.PDGS)
export const isInternalGDPS = isInternalDefinitionEntry(InternalDefinitionEntryType.GDPS)
export const isInternalGSSub = isInternalDefinitionEntry(InternalDefinitionEntryType.GSSub)
export const isInternalPSSub = isInternalDefinitionEntry(InternalDefinitionEntryType.PSSub)
