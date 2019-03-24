export interface GitApi {
    checkout(hash: string): Promise<void>
}

declare const git: GitApi
