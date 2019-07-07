import { PackageInfo } from "../../package/info";
import { Manifest } from "../../registry/package";
import { Registries } from "../../registry/registries";
import { PackageDefinition, PackageEntry, PackageGDGSEntry, PackageGDPSEntry, PackagePDGSEntry, PackagePDPSEntry } from "../../types/package.v1";
export interface PackageDefinitionSummary {
    packages: Array<PackageGDGSEntry | PackageGDPSEntry | PackagePDGSEntry | PackagePDPSEntry>;
    definition: {
        [k: string]: any;
    };
}
export declare function getEntries(pkg: PackageDefinition, manifest: Manifest, type: string, pkgType: string): PackageEntry[];
export declare function fromPackageDefinition(pkg: PackageDefinition, info: PackageInfo, registries: Registries, pkgType: string): PackageDefinitionSummary;
