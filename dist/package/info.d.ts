import { InternalDefinitionEntry, InternalEntry, InternalGDGSEntry, InternalGDPSEntry, InternalPDGSEntry, InternalPDPSEntry, InternalPSSubEntry } from './entry';
import { PackageType } from './type';
export declare function classifyType(entry: InternalEntry): PackageType;
export declare const isPackageInfo: <K extends PackageType>(condition: K) => (entry: Partial<PackageInfo<InternalEntry, PackageInfoOptions>>) => entry is PackageTypeToInternalEntry[K];
export declare const isGDGS: (entry: Partial<PackageInfo<InternalEntry, PackageInfoOptions>>) => entry is PackageInfo<InternalGDGSEntry, PackageInfoOptions>;
export declare const isPDPS: (entry: Partial<PackageInfo<InternalEntry, PackageInfoOptions>>) => entry is PackageInfo<import("../types/definitions.v1").RegistryPDPSEntry, PDPSPackageOptions>;
export declare const isPDGS: (entry: Partial<PackageInfo<InternalEntry, PackageInfoOptions>>) => entry is PackageInfo<InternalPDGSEntry, PackageInfoOptions>;
export declare const isGDPS: (entry: Partial<PackageInfo<InternalEntry, PackageInfoOptions>>) => entry is PackageInfo<import("../types/definitions.v1").RegistryGDPSEntry, PackageInfoOptions>;
export declare const isPSSub: (entry: Partial<PackageInfo<InternalEntry, PackageInfoOptions>>) => entry is PackageInfo<import("../types/definitions.v1").RegistryPSSubEntry, PSSubPackageOptions>;
export declare function getId(info: Partial<PackageInfo>, type: string): string;
export declare function getName(info: Partial<PackageInfo>): string;
export declare function getNameFromEntry(entry: InternalDefinitionEntry): string;
export declare function getAlias(info: Partial<PackageInfo>): string | undefined;
export declare function getDirectories(info: Partial<PackageInfo>): PackageInfo['directories'];
export declare function getPackageInfo<E extends InternalEntry, O extends PackageInfoOptions>(entry: E, type: string, pkgType: PackageType, options?: O): PackageInfo<E, O>;
export interface PackageTypeToInternalEntry {
    [PackageType.GDGS]: GDGSPackageInfo;
    [PackageType.PDPS]: PDPSPackageInfo;
    [PackageType.PDGS]: PackageInfo<InternalPDGSEntry>;
    [PackageType.GDPS]: PackageInfo<InternalGDPSEntry>;
    [PackageType.PSSub]: PSSubPackageInfo;
}
export interface PackageInfo<E = InternalEntry, O = PackageInfoOptions> {
    type: PackageType;
    entry: E;
    id: string;
    name: string;
    directories: {
        definition: string;
        source: string;
    };
    manifest: string;
    alias?: string;
    options?: O;
}
export interface PackageInfoOptions {
    allowDevelopment: boolean;
}
export declare type PDPSPackageInfo = PackageInfo<InternalPDPSEntry, PDPSPackageOptions>;
export declare type PSSubPackageInfo = PackageInfo<InternalPSSubEntry, PSSubPackageOptions>;
export declare type GDGSPackageInfo = PackageInfo<InternalGDGSEntry, PackageInfoOptions>;
export interface PDPSPackageOptions extends PackageInfoOptions {
    alias?: string;
    rootDirectory: string;
    rootName: string;
}
export interface PSSubPackageOptions extends PackageInfoOptions {
    rootDirectory: string;
    rootName: string;
}
export interface GSSubPackageOptions extends PackageInfoOptions {
}