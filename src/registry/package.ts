import path from 'path'
import { createSourceResolver, isGitEntry, isPathEntry } from '~/resolver/source/factory'
import { SourceResolver } from '~/resolver/source/sourceResolver'
import { RegistryEntry } from '~/types/definitions.v1'
import { Manifest } from './manifest'
import { normalize } from 'upath'

export interface PackageOptions {
    parent?: Package
    root?: Package
    isRoot?: boolean
}

export class Package {
    public name!: string
    public vendor!: string
    public fullName!: string
    public resolver: SourceResolver
    public manifest: Manifest
    public options: PackageOptions
    public entry: RegistryEntry
    private loaded: boolean = false

    constructor(manifest: Manifest, entry: RegistryEntry, options?: PackageOptions) {
        this.manifest = manifest
        this.resolver = createSourceResolver(entry, this)
        this.entry = entry
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
            this.fullName = this.getFullName()
            this.name = path.basename(entry.path)
            this.vendor = 'Local'
        }
    }

    public getHash() {
        return `${this.manifest.type}:${this.resolver.getName()}:${this.fullName}`
    }

    public async load(): Promise<void> {
        if (!this.loaded) {
            this.loaded = true
            await this.resolver.load()
        }
    }

    public async extract(hash: string) {
        await this.resolver.extract(hash)
    }

    public getFullName(): string {
        if (this.options.isRoot) {
            return '$ROOT'
        } else if (this.options.root) {
            return `${this.getRootName()}:${normalize(this.resolver.getPath())}`
        }
        return this.resolver.getPath()
    }

    public getRootName(): string {
        if (this.options.isRoot) {
            return '$ROOT'
        } else if (this.options.root) {
            return this.options.root.options.isRoot ? '$ROOT' : this.options.root.fullName
        } else {
            throw new Error('This should not be called')
        }
    }
}
