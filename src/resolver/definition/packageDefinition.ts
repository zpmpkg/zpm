import { fromPairs, get, map } from 'lodash'
import { PackageGitEntry, PackagePathEntry } from '~/types/package.v1'
import { PackageOptions } from '../../registry/package'
import { isPathPackageEntry, isGitPackageEntry } from '~/solver/package'

export interface PackageDefinitionSummary {
    packages: {
        path: { [k: string]: PackagePathEntry[] }
        git: { [k: string]: PackageGitEntry[] }
    }
}

export function fromPackageDefinition(
    pkg: PackageDefinitionSummary,
    options: PackageOptions
): PackageDefinitionSummary {
    // @todo: MOAR
    const keys: string[] = ['libraries']
    return {
        packages: {
            path: fromPairs(
                map(keys, (k: string) => [
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
                map(keys, (k: string) => [
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
