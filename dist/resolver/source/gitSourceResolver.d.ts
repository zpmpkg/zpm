import { Version } from "../../common/version";
import { SourceResolver } from "./sourceResolver";
export declare class GitSourceResolver extends SourceResolver {
    loaded: boolean;
    gitDefinition: boolean;
    load(): Promise<boolean>;
    getName(): string;
    getDefinitionPath(): string;
    getRepositoryPath(): string;
    isDefinitionSeparate(): boolean;
    getVersions(): Promise<{
        version: Version;
        hash: string;
        name: string;
    }[]>;
    getPath(): string;
    getCachePath(): string;
    mayPull(): Promise<any>;
    private getPullInfo;
    private getFetchInfo;
}
