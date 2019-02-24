// import { PackageDescription } from '~/resolver/definition/packageDefinition'

// export interface SATMeta {
//     settingList?: Array<{
//         depth?: number
//         child?: number
//         settings: {
//             [k: string]: any
//         }
//     }>

//     settings: {
//         [k: string]: any
//     }
//     description: PackageDescription
// }

export interface SATGitPackage {
    name: string
    version: string
    hash: string
    settings: any
}

export interface SATPathPackage {
    root: string
    path: string
    name: string
    settings: any
}

export interface SATNamedPackage {
    name: string
    path: string
    version: string
    hash: string
    settings: any
}

export interface SATSolution {
    git: { [k: string]: SATGitPackage[] }
    path: { [k: string]: SATPathPackage[] }
    named: { [k: string]: SATNamedPackage[] }
}
