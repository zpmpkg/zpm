import { Spinner } from "../cli/spinner";
export declare function loadJson(file: string): Promise<any>;
export declare function loadJsonOrYaml(file: string): Promise<any>;
export declare function loadJsonOrYamlSimple(file: string): Promise<any>;
export declare function writeJson(file: string, object: any): Promise<boolean>;
export declare function glob(source: string | string[], root: string, excludes?: string[]): Promise<string[]>;
export declare function copy(source: string | string[], root: string, destination: string, excludes?: string[], options?: {
    spinner?: Spinner;
}): Promise<void>;
export declare function isSubDirectory(child: string, parent: string): boolean;
export declare function transformPath(p: string): string;
