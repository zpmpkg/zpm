import { Spinner } from "../cli/spinner";
export declare class FsApi {
    source: string;
    target: string;
    spinner?: Spinner;
    constructor(source: string, target: string, spinner?: Spinner);
    copy(sources: string[], options?: {
        excludes?: string[];
    }): Promise<void>;
    exists(file: string, where: 'source' | 'target'): boolean;
}
