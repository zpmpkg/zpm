import { ConfigurationSchema } from "../types/configuration.v1";
export declare class Configuration {
    values: Readonly<ConfigurationSchema>;
    private names;
    private loaded;
    private validator;
    load(): void;
    private loadOverrideFile;
    private storeFileContent;
    private loadFile;
}
