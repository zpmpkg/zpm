import { Configuration } from "./common/config";
import { Registries } from "./registry/registries";
import { Package } from './package/package';
export declare class ZPM {
    root: Package;
    config: Configuration;
    registries: Registries;
    load(): Promise<boolean>;
}
