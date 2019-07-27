import { InternalDefinitionEntry, InternalEntry, InternalGDGSEntry, InternalGDPSEntry, InternalGSSubEntry, InternalPDGSEntry, InternalPDPSEntry, InternalPSSubEntry } from './internal';
import { PackageType } from './type';
export declare function classifyType(entry: InternalEntry): PackageType;
export declare const isPackageInfo: <K extends PackageType>(condition: K) => (entry: Partial<PackageInfo<InternalEntry, PackageInfoOptions>>) => entry is PackageTypeToInternalEntry[K];
export declare const isGDGS: (entry: Partial<PackageInfo<InternalEntry, PackageInfoOptions>>) => entry is PackageInfo<InternalGDGSEntry, PackageInfoOptions>;
export declare const isPDPS: (entry: Partial<PackageInfo<InternalEntry, PackageInfoOptions>>) => entry is PackageInfo<InternalPDPSEntry, PDPSPackageOptions>;
export declare const isPDGS: (entry: Partial<PackageInfo<InternalEntry, PackageInfoOptions>>) => entry is PackageInfo<InternalPDGSEntry, PDGSPackageOptions>;
export declare const isGDPS: (entry: Partial<PackageInfo<InternalEntry, PackageInfoOptions>>) => entry is PackageInfo<InternalGDPSEntry, PackageInfoOptions>;
export declare const isPSSub: (entry: Partial<PackageInfo<InternalEntry, PackageInfoOptions>>) => entry is PackageInfo<InternalPSSubEntry, PSSubPackageOptions>;
export declare const isGSSub: (entry: Partial<PackageInfo<InternalEntry, PackageInfoOptions>>) => entry is PackageInfo<InternalGSSubEntry, GSSubPackageOptions>;
export declare function getId(info: Partial<PackageInfo>, type: string): string;
export declare function getName(info: Partial<PackageInfo>): string;
export declare function getNameFromEntry(entry: InternalDefinitionEntry): string;
export declare function getAlias(info: Partial<PackageInfo>): string | undefined;
export declare function getDirectories(info: Partial<PackageInfo>): PackageInfo['directories'];
export declare function getPackageInfo<E extends InternalEntry, O extends PackageInfoOptions>(entry: E, type: string, pkgType: PackageType, options?: O): PackageInfo<E, O>;
export interface PackageTypeToInternalEntry {
    [PackageType.GDGS]: GDGSPackageInfo;
    [PackageType.PDPS]: PDPSPackageInfo;
    [PackageType.PDGS]: PDGSPackageInfo;
    [PackageType.GDPS]: PackageInfo<InternalGDPSEntry>;
    [PackageType.PSSub]: PSSubPackageInfo;
    [PackageType.GSSub]: GSSubPackageInfo;
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
    isSubPackage: boolean;
}
export interface PackageInfoOptions {
    allowDevelopment: boolean;
    mayChangeRegistry: boolean;
}
export declare type PDPSPackageInfo = PackageInfo<InternalPDPSEntry, PDPSPackageOptions>;
export declare type PDGSPackageInfo = PackageInfo<InternalPDGSEntry, PDGSPackageOptions>;
export declare type PSSubPackageInfo = PackageInfo<InternalPSSubEntry, PSSubPackageOptions>;
export declare type GSSubPackageInfo = PackageInfo<InternalGSSubEntry, GSSubPackageOptions>;
export declare type GDGSPackageInfo = PackageInfo<InternalGDGSEntry, PackageInfoOptions>;
export interface PDPSPackageOptions extends PackageInfoOptions {
    alias?: string;
    rootDirectory: string;
    rootName: string;
}
export interface PSSubPackageOptions extends PackageInfoOptions {
    rootDirectory: string;
    rootName: string;
    subPath: string;
}
export interface PDGSPackageOptions extends PackageInfoOptions {
    rootName: string;
    rootDirectory: string;
}
export interface GSSubPackageOptions extends PackageInfoOptions {
    rootName: string;
    rootDirectory: string;
    packageName: string;
    packageVendor?: string;
    packageDirectory: string;
    subPath: string;
}
export interface PSSubPackageOptions extends PackageInfoOptions {
}
