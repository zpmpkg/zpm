// tslint:disable-next-line:ordered-imports
import { fromPairs, get, map, keys, uniq } from 'lodash'
// tslint:disable-next-line:ordered-imports
import { PackageGitEntry, PackagePathEntry, PackageDefinition } from '~/types/package.v1'
import { PackageOptions } from '../../registry/package'
import { isPathPackageEntry, isGitPackageEntry } from '~/solver/package'

export interface PackageDefinitionSummary {
    packages: {
        path: { [k: string]: PackagePathEntry[] }
        git: { [k: string]: PackageGitEntry[] }
    }
}

export function fromPackageDefinition(
    pkg: PackageDefinition,
    options: PackageOptions
): PackageDefinitionSummary {
    const types: string[] = uniq([
        ...keys(get(pkg, 'production')),
        ...keys(get(pkg, 'development')),
    ])
    return {
        packages: {
            path: fromPairs(
                map(types, (k: string) => [
                    k,
                    map(
                        [
                            ...get(pkg, ['production', k], []),
                            ...(options.isRoot ? get(pkg, ['development', k], []) : []),
                        ].filter(isPathPackageEntry),
                        (p): PackagePathEntry => ({
                            path: p.path,
                        })
                    ),
                ])
            ),
            git: fromPairs(
                map(types, (k: string) => [
                    k,
                    map(
                        [
                            ...get(pkg, ['production', k], []),
                            ...(options.isRoot ? get(pkg, ['development', k], []) : []),
                        ].filter(isGitPackageEntry),
                        (p): PackageGitEntry => ({
                            name: p.name,
                            version: p.version,
                        })
                    ),
                ])
            ),
        },
    }
}
