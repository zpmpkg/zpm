export interface PackageVersionApi {
    hash?: string;
    settings: {
        [k: string]: any;
    };
    definition: {
        [k: string]: any;
    };
    usage: {
        [k: string]: any;
    };
    global: {
        [k: string]: any;
    };
    target: string;
    source: string;
}
