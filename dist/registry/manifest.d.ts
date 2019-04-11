import ajv = require('ajv');
import { Package, PackageOptions } from "./package";
import { ManifestOptions, RegistryEntry } from "../types/definitions.v1";
import { Registries } from './registries';
export declare class Manifest {
    type: string;
    registries: Registries;
    entries: {
        [name: string]: Package;
    };
    options: ManifestOptions;
    packageValidator?: ajv.ValidateFunction;
    private validator;
    constructor(registries: Registries, type: string, options?: ManifestOptions);
    load(): Promise<void>;
    add(entry: RegistryEntry & {
        name?: string;
    }, options?: PackageOptions): Package;
    private loadFile;
}
