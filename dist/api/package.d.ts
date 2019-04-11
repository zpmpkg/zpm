export interface PackageApi {
    hash?: string;
    settings: {
        [k: string]: any;
    };
    description: {
        [k: string]: any;
    };
    usage: {
        [k: string]: any;
    };
    globals: {
        [k: string]: any;
    };
}
