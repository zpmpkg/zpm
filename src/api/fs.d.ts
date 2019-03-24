export interface FsApi {
    copy(sources: string[], options?: { excludes?: string[] }): Promise<void>
}

declare const fs: FsApi
