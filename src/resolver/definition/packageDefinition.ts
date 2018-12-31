import { fromPairs, get, map } from 'lodash'
import { PackageSchema } from '~/types/package.v1'
import { PackageOptions } from '../../registry/package'

export interface PackageDefinitionSummary {
    includes: string[]
    packages: PackageDefinitionEntries
}
export type PackageDefinitionEntries =
    | {
          libraries: PackageDefinitionEntry[]
      }
    | {
          [k: string]: PackageDefinitionEntry[]
      }

export interface PackageDefinitionEntry {
    name: string
    version: string
}

export function fromPackageDefinition(
    pkg: PackageDefinitionSummary,
    options: PackageOptions
): PackageDefinitionSummary {
    return {
        includes: [], // pkg.includes,
        packages: mapEntries(['libraries'], pkg, options),
    }
}

function mapEntries(
    keys: string[],
    pkg: PackageSchema,
    options: PackageOptions
): PackageDefinitionEntries {
    return fromPairs(
        map(keys, (k: string) => [
            k,
            map(
                [
                    ...get(pkg, ['production', k], []),
                    ...(options.isRoot ? get(pkg, ['development', k], []) : []),
                ] as PackageDefinitionEntry[],
                (p: PackageDefinitionEntry): PackageDefinitionEntry => ({
                    name: p.name,
                    version: p.version,
                })
            ),
        ])
    ) as PackageDefinitionEntries
}
