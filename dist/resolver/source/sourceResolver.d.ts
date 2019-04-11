import { Version } from "../../common/version";
import { Package } from "../../registry/package";
import { DefinitionResolver } from '../definition/definitionResolver';
export interface SourceVersions {
    version: Version;
    name: string;
    hash: string;
}
export declare abstract class SourceResolver {
    definitionResolver: DefinitionResolver;
    repository: string;
    definition?: string;
    package: Package;
    constructor(repository: string, definition: string | undefined, pkg: Package);
    abstract load(): Promise<boolean>;
    abstract getDefinitionPath(): string;
    abstract getRepositoryPath(): string;
    abstract isDefinitionSeparate(): boolean;
    abstract getVersions(): Promise<SourceVersions[]>;
    abstract getTags(): Promise<SourceVersions[]>;
    abstract getPath(): string;
    abstract getName(): string;
}
