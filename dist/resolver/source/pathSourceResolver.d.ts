import { SourceResolver } from "./sourceResolver";
export declare class PathSourceResolver extends SourceResolver {
    load(): Promise<boolean>;
    getName(): string;
    getDefinitionPath(): string;
    getRepositoryPath(): string;
    isDefinitionSeparate(): boolean;
    getVersions(): Promise<never[]>;
    getPath(): string;
}
