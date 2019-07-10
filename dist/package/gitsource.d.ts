import { Version } from "../common/version";
export declare class GitSource {
    loaded: boolean;
    constructor();
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
