import { InternalDefinitionEntry } from "../../package/entry";
import { PackageInfo } from "../../package/info";
import { Manifest } from "../../registry/package";
import { Registries } from "../../registry/registries";
import { PackageDefinition } from "../../types/package.v1";
export interface PackageDefinitionSummary {
    packages: InternalDefinitionEntry[];
    definition: {
        [k: string]: any;
    };
}
export declare function getEntries(pkg: PackageDefinition, manifest: Manifest, type: string, pkgType: string): InternalDefinitionEntry[];
export declare function fromPackageDefinition(pkg: PackageDefinition, info: PackageInfo, registries: Registries, pkgType: string): PackageDefinitionSummary;
