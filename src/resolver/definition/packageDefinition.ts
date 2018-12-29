import { fromPairs, get, map } from 'lodash'
import { PackageEntry, PackageSchema } from '~/types/package.v1'
import { PackageOptions } from '../../registry/package'

export interface PackageDefinitionSummary {
    includes: string[]
    packages: {
        public: PackageDefinitionEntries
        private: PackageDefinitionEntries
    }
}
export type PackageDefinitionEntries =
    | {
          libraries: PackageDefinitionEntry[]
      }
    | {
          [k: string]: PackageDefinitionSummary[]
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
        includes: [], //pkg.includes,
        packages: {
            private: mapEntries('private', ['libraries'], pkg, options),
            public: mapEntries('public', ['libraries'], pkg, options),
        },
    }
}

function mapEntries(
    environment: string,
    keys: string[],
    pkg: PackageSchema,
    options: PackageOptions
): PackageDefinitionEntries {
    return fromPairs(
        map(keys, (k: string) => [
            k,
            map(
                [
                    ...get(pkg, ['production', environment, k], []),
                    ...(options.isRoot ? get(pkg, ['development', k, environment], []) : []),
                ] as PackageDefinitionEntry[],
                (p: PackageEntry): PackageEntry => ({
                    name: p.name,
                    version: p.version,
                })
            ),
        ])
    ) as PackageDefinitionEntries
}
