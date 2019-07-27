import { Version } from "../../common/version";
export interface GitVersion {
    version: Version;
    hash: string;
    name: string;
}
export declare function listGitVersions(directory: string): Promise<GitVersion[]>;
