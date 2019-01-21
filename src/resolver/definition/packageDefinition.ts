// tslint:disable-next-line:ordered-imports
import { fromPairs, get, keys, map, uniq } from 'lodash'
import { isGitPackageEntry, isPathPackageEntry } from '~/solver/package'
// tslint:disable-next-line:ordered-imports
import { PackageDefinition, PackageGitEntry, PackagePathEntry } from '~/types/package.v1'
import { PackageOptions } from '../../registry/package'

export interface PackagePathSummary extends PackagePathEntry {
    settings: {
        [k: string]: any
    }
}

export interface PackageGitSummary extends PackageGitEntry {
    settings: {
        [k: string]: any
    }
}

export interface PackageDefinitionSummary {
    packages: {
        path: { [k: string]: PackagePathSummary[] }
        git: { [k: string]: PackageGitSummary[] }
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
                        (p): PackagePathSummary => ({
                            path: p.path,
                            settings: {},
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
                        (p): PackageGitSummary => ({
                            name: p.name,
                            version: p.version,
                            settings: {},
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
