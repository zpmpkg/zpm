import { InternalDefinitionEntry, PackageInfo, PackageVersion } from "../../package/internal";
import { Manifest } from "../../registry/package";
import { Registries } from "../../registry/registries";
import { PackageDefinition } from "../../types/package.v1";
export interface PackageDefinitionSummary {
    packages: InternalDefinitionEntry[];
    definition: {
        [k: string]: any;
    };
}
export declare function getEntries(pkg: PackageDefinition, manifest: Manifest, type: string, pkgType: string, parent: PackageVersion): InternalDefinitionEntry[];
export declare function fromPackageDefinition(pkg: PackageDefinition, info: PackageInfo, registries: Registries, pkgType: string, parent: PackageVersion): PackageDefinitionSummary;
