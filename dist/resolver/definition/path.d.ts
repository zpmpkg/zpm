import { IPackage } from "../../package/package";
import { PackageDefinition, PackageSchema } from "../../types/package.v1";
import { PackageDefinitionSummary } from './packageDefinition';
export declare function getPathPackageDefinition(pkg: IPackage): Promise<PackageDefinitionSummary>;
export declare function getContent(directory: string, version?: string): Promise<{
    content: PackageDefinition | undefined;
    path?: string;
}>;
export declare function getYamlDefinition(yml: PackageSchema[], version?: string): PackageDefinition | undefined;
export declare function loadFile(file: string): Promise<PackageSchema[] | PackageDefinition | undefined>;
export declare function isSingularYaml(yml: PackageSchema[]): yml is PackageDefinitionSummary[];
export declare function getDefinition(yml: PackageSchema): PackageDefinitionSummary;
