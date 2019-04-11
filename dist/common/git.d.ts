/// <reference types="node" />
import simplegit, { Options } from 'simple-git/promise';
import { Spinner } from "../cli/spinner";
export declare const git: (cwd?: string | undefined) => simplegit.SimpleGit;
export declare function _showRef(destination: string, options?: string[]): Promise<string>;
export declare function _pull(destination: string, remote?: string, branch?: string, options?: Options): Promise<simplegit.PullResult>;
export declare function _fetch(destination: string, options?: {
    remote?: string;
    branch?: string;
    options?: Options;
    stream?: NodeJS.WritableStream;
}): Promise<simplegit.FetchResult>;
export declare function _tags(destination: string, options?: Options): Promise<simplegit.TagResult>;
export declare function _clone(destination: string, remote: string, options?: {
    options?: string[];
    stream?: NodeJS.WritableStream;
}): Promise<string>;
export interface CloneOrPullResult {
    newCommits?: number;
    cloned: boolean;
    latest: string;
}
export declare function _cloneOrPull(destination: string, url: string, options?: {
    branch?: string;
    stream?: NodeJS.WritableStream;
}): Promise<CloneOrPullResult>;
export interface CloneOrFetchResult {
    newCommits?: number;
    cloned: boolean;
}
export declare function _cloneOrFetch(destination: string, url: string, options?: {
    branch?: string;
    stream?: NodeJS.WritableStream;
}): Promise<CloneOrFetchResult>;
export declare function _getBranchSHA1(destination: string, branch?: string): Promise<string>;
export declare function _hasSubmodules(destination: string): Promise<boolean>;
export declare function hasHash(destination: string, hash: string): Promise<boolean>;
export declare function catFile(destination: string, options?: string[]): Promise<string | undefined>;
export declare function checkout(destination: string, hash: string, options?: {
    branch?: string;
    spinner?: Spinner;
}): Promise<void>;
export declare function getBranch(name?: string): string | undefined;
export declare const pull: typeof _pull;
export declare const clone: typeof _clone;
export declare const cloneOrPull: typeof _cloneOrPull;
export declare const cloneOrFetch: typeof _cloneOrFetch;
export declare const tags: typeof _tags;
export declare const showRef: typeof _showRef;
export declare const getBranchSHA1: typeof _getBranchSHA1;
