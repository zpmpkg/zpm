import { InternalDefinitionEntry, PackageVersion } from './internal'

export interface ParentUsage {
    entry: InternalDefinitionEntry
    addedBy: PackageVersion
}

export interface PackageVersionUsage {
    [k: string]: {
        settings: any
        optional: boolean
    }
}
