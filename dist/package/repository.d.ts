import { Spinner } from "../cli/spinner";
export declare class Repository {
    directory: string;
    url: string;
    loaded: boolean;
    private mutex;
    constructor(directory: string, url: string);
    checkout(hash: string, spinner?: Spinner): Promise<void>;
    cloneOrPull(what: string): Promise<void>;
    cloneOrFetch(what: string): Promise<void>;
    private getPullInfo;
    private getFetchInfo;
}
export declare function createRepository(directory: string, url?: string): Repository;
