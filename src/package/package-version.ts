import { Version } from '~/common/version'

export interface SourceVersion {
    version: Version
    name: string
    hash: string
}

// const packageVersionCache: Map<string, PackageVersion> = new Map<string, PackageVersion>()
// export function createPackageVersion(
//     getId: () => string,
//     factory: (id: string) => IPackageVersion
// ): PackageVersion {
//     // only allow one version of the same package and version
//     const key = getId()
//     if (!packageVersionCache.has(key)) {
//         packageVersionCache.set(key, factory(key))
//     }
//     return packageVersionCache.get(key)!
// }
