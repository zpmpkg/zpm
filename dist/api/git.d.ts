import { Spinner } from "../cli/spinner";
export declare class GitApi {
    source: string;
    spinner?: Spinner;
    constructor(source: string, spinner?: Spinner);
    checkout(hash: string): Promise<void>;
}
