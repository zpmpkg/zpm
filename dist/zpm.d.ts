import { Configuration } from "./common/config";
import { Registries } from "./registry/registries";
import { Package } from './registry/package';
export declare class ZPM {
    root: Package;
    config: Configuration;
    registries: Registries;
    load(): Promise<boolean>;
}
