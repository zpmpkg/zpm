import { RegistryDefinition } from "../types/definitions.v1";
export declare class Registry {
    urlOrPath: string;
    branch?: string;
    valid: boolean;
    directory: string | undefined;
    isLocal: boolean;
    isUpdated: boolean;
    name?: string;
    constructor(urlOrPath: string, options?: {
        branch?: string;
        name?: string;
    });
    update(): Promise<RegistryDefinition[] | undefined>;
    private mayPull;
    private getHitInfo;
}
