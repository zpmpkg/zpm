import { IPackage, PackageVersion } from "../../package/internal";
import { PackageDefinition } from "../../types/package.v1";
import { GitVersion } from '../source/git';
import { PackageDefinitionSummary } from './definition';
export declare function getGitPackageDefinition(pkg: IPackage, gitVersion: GitVersion, parent: PackageVersion): Promise<PackageDefinitionSummary>;
export declare function getGitContent(directory: string, gitVersion: GitVersion): Promise<{
    content: PackageDefinition | undefined;
    path?: string;
}>;
