import { Spinner } from "../cli/spinner";
export declare class ShellApi {
    source: string;
    target: string;
    spinner?: Spinner;
    constructor(source: string, target: string, spinner?: Spinner);
    exec(command: string): Promise<any>;
}
