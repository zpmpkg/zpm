import { Mutex } from 'async-mutex'
import { sha256 } from 'js-sha256'
import path from 'path'
import { normalize } from 'upath'
import { createSourceResolver, isNamedEntry, isPathEntry } from '~/resolver/source/factory'
import { SourceResolver } from '~/resolver/source/sourceResolver'
import { RegistryEntry } from '~/types/definitions.v1'
import { Manifest } from './manifest'

export const enum PackageType {
    Path,
    Named,
}

export interface PackageOptions {
    type: PackageType
    parent?: Package
    root?: Package
    isRoot?: boolean
    rootHash?: string
    forceName?: boolean
    absolutePath?: string
}

export class Package {
    public name!: string
    public vendor!: string
    public fullName!: string
    public source: SourceResolver
    public manifest: Manifest
    public options: PackageOptions
    public entry: RegistryEntry
    private loaded: boolean = false
    private loadedEntryHash?: string
    private mutex = new Mutex()

    constructor(manifest: Manifest, entry: RegistryEntry, options?: PackageOptions) {
        this.manifest = manifest
        this.source = createSourceResolver(entry, this)
        this.entry = entry
        this.options = {
            type: PackageType.Named,
            isRoot: false,
            ...options,
        }

        if (isNamedEntry(entry)) {
            this.fullName = entry.name
            const split = entry.name.split('/')
            this.name = split[1]
            this.vendor = split[0]
        } else if (isPathEntry(entry)) {
            this.fullName = this.getFullName()
            this.name = entry.name || path.basename(entry.path)
            this.vendor = 'Local'
        }
    }

    public async overrideEntry(entry: RegistryEntry) {
        if (this.calculateEntryHash()) {
            await this.mutex.runExclusive(async () => {
                this.entry = entry
                this.source = createSourceResolver(entry, this)
                await this.source.load()
            })
        }
    }

    public getHash() {
        return `${this.manifest.type}:${this.source.getName()}:${this.fullName}`
    }

    public async load(): Promise<boolean> {
        if (!this.loaded) {
            this.loaded = await this.source.load()
        }
        return this.loaded
    }

    public getFullName(): string {
        if (this.options.isRoot) {
            return '$ROOT'
        } else if (this.options.rootHash) {
            return `${this.getRootName()}:${normalize(this.source.getPath())}`
        }
        return this.source.getPath()
    }

    public getRootName(): string {
        if (this.options.isRoot) {
            return '$ROOT'
        } else if (this.options.root) {
            return this.options.root.options.isRoot ? '$ROOT' : this.options.rootHash!
        } else {
            throw new Error('This should not be called')
        }
    }

    private calculateEntryHash() {
        const oldValue = this.loadedEntryHash
        this.loadedEntryHash = sha256(JSON.stringify(this.entry))
        return oldValue !== this.loadedEntryHash
    }
}
