export interface SATGitPackage {
    name: string
    version: string
    hash: string
}

export interface SATPathPackage {
    root: string
    path: string
    name: string
}

export interface SATSolution {
    git: { [k: string]: SATGitPackage[] }
    path: { [k: string]: SATPathPackage[] }
}
