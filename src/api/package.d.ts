export interface PackageApi {
    hash?: string
    settings: { [k: string]: any }
}

declare const pkg: PackageApi
