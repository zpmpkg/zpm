import path from 'path'
import { createSourceResolver, isGitEntry, isPathEntry } from '~/resolver/source/factory'
import { SourceResolver } from '~/resolver/source/sourceResolver'
import { RegistryEntry } from '~/types/definitions.v1'
import { Manifest } from './manifest'

export interface PackageOptions {
    isRoot?: boolean
}

export class Package {
    public name!: string
    public vendor!: string
    public fullName!: string
    public resolver: SourceResolver
    public manifest: Manifest
    public options: PackageOptions
    private loaded: boolean = false

    constructor(manifest: Manifest, entry: RegistryEntry, options?: PackageOptions) {
        this.manifest = manifest
        this.resolver = createSourceResolver(entry, this)
        this.options = {
            isRoot: false,
            ...options,
        }

        if (isGitEntry(entry)) {
            this.fullName = entry.name
            const split = entry.name.split('/')
            this.name = split[1]
            this.vendor = split[0]
        } else if (isPathEntry(entry)) {
            this.fullName = entry.path
            this.name = path.basename(entry.path)
            this.vendor = 'Local'
        }
    }

    public getHash() {
        return `${this.manifest.type}:${this.resolver.getName()}:${this.fullName}`
    }

    public async load(): Promise<boolean> {
        if (!this.loaded) {
            this.loaded = await this.resolver.load()
        }
        return this.loaded
    }

    public async extract(hash: string) {
        await this.resolver.extract(hash)
    }
}
