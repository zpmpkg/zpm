import { Spinner } from "../cli/spinner";
import { Repository } from "../package/repository";
export declare class GitApi {
    repository: Repository;
    spinner?: Spinner;
    constructor(source: string, spinner?: Spinner);
    checkout(hash: string): Promise<void>;
}
