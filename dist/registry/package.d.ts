import ajv = require('ajv');
import { InternalDefinitionEntry, Package, PackageInfoOptions, InternalEntry } from "../package/internal";
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
    add<E extends InternalEntry, O extends PackageInfoOptions>(entry: E, options?: O, registry?: Registry, force?: boolean): {
        name: string;
        alias: string | undefined;
        package: Package;
    };
    search(entry: InternalDefinitionEntry): {
        package: Package | undefined;
        name: string;
    };
    searchByName(name: string): Package | undefined;
    private loadFile;
}
