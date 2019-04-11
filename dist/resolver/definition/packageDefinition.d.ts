import { Registries } from "../../registry/registries";
import { PackageDefinition, PackageGitEntry, PackagePathEntry } from "../../types/package.v1";
import { PackageOptions } from '../../registry/package';
interface PackagePathDefinitionEntry extends PackagePathEntry {
    isBuildDefinition: boolean;
}
interface PackageGitDefinitionEntry extends PackageGitEntry {
    isBuildDefinition: boolean;
}
export interface PackageDefinitionSummary {
    packages: {
        path: {
            [k: string]: PackagePathDefinitionEntry[];
        };
        named: {
            [k: string]: PackageGitDefinitionEntry[];
        };
    };
    description: PackageDescription;
    definitionPath: string;
}
export interface PackageDescription {
    [k: string]: any;
}
export declare function fromPackageDefinition(pkg: PackageDefinition, definitionPath: string, options: PackageOptions, registries: Registries, pkgType: string): PackageDefinitionSummary;
export {};
