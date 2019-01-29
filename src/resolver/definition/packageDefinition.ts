// tslint:disable-next-line:ordered-imports
import { fromPairs, get, keys, map, uniq } from 'lodash'
import { isGitPackageEntry, isPathPackageEntry } from '~/solver/package'
// tslint:disable-next-line:ordered-imports
import { PackageDefinition, PackageGitEntry, PackagePathEntry } from '~/types/package.v1'
import { PackageOptions } from '../../registry/package'

export interface PackageDefinitionSummary {
    packages: {
        path: { [k: string]: PackagePathEntry[] }
        git: { [k: string]: PackageGitEntry[] }
    }
    description: PackageDescription
}

export interface PackageDescription {
    extraction: {
        strategy: {}
    }
    build: {
        strategy: {}
    }
}

export function fromPackageDefinition(
    pkg: PackageDefinition,
    options: PackageOptions
): PackageDefinitionSummary {
    const types: string[] = uniq([...keys(get(pkg, 'requires')), ...keys(get(pkg, 'development'))])
    return {
        packages: {
            path: fromPairs(
                map(types, (k: string) => [
                    k,
                    map(
                        [
                            ...get(pkg, ['requires', k], []),
                            ...(options.isRoot ? get(pkg, ['development', k], []) : []),
                        ].filter(isPathPackageEntry),
                        (p): PackagePathEntry => ({
                            path: p.path,
                            settings: p.settings || {},
                        })
                    ),
                ])
            ),
            git: fromPairs(
                map(types, (k: string) => [
                    k,
                    map(
                        [
                            ...get(pkg, ['requires', k], []),
                            ...(options.isRoot ? get(pkg, ['development', k], []) : []),
                        ].filter(isGitPackageEntry),
                        (p): PackageGitEntry => ({
                            name: p.name,
                            version: p.version,
                            settings: p.settings || {},
                        })
                    ),
                ])
            ),
        },
        description: {
            extraction: {
                strategy: {},
            },
            build: {
                strategy: {},
            },
        },
    }
}
