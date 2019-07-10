import ajv = require('ajv');
import { InternalDefinitionEntry, InternalEntry } from "../package/entry";
import { PackageInfoOptions } from "../package/info";
import { Package } from "../package/package";
import { ManifestOptions } from "../types/definitions.v1";
import { Registries } from './registries';
import { Registry } from './registry';
export declare class Manifest {
    type: string;
    registries: Registries;
    entries: Map<string, Package>;
    options: ManifestOptions;
    packageValidator?: ajv.ValidateFunction;
    private validator;
    constructor(registries: Registries, type: string, options?: ManifestOptions);
    load(): Promise<void>;
    add<E extends InternalEntry, O extends PackageInfoOptions>(entry: E, options?: O, registry?: Registry): Package;
    search(entry: InternalDefinitionEntry): {
        package: Package | undefined;
        name: string;
    };
    searchByName(name: string): Package | undefined;
    private loadFile;
}
