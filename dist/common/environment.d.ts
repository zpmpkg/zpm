export declare function userData(): string;
export declare function userConfig(): string;
export declare function userCache(): string;
export declare function userLogs(): string;
export declare const environment: {
    directory: {
        configuration: string;
        logs: string;
        registries: string;
        storage: string;
        packages: string;
        extract: string;
        zpm: string;
        workingdir: string;
    };
};
export declare function loadEnvironment(): Promise<void>;
