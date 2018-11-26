import { createSourceResolver } from '~/resolver/source/factory'
import { SourceResolver } from '~/resolver/source/sourceResolver'
import { Entry } from '~/types/definitions.v1'
import { Manifest } from './manifest'

export class Package {
    public name: string
    public vendor: string
    public fullName: string
    public resolver: SourceResolver
    public manifest: Manifest

    constructor(manifest: Manifest, entry: Entry) {
        this.manifest = manifest
        this.fullName = entry.name
        this.resolver = createSourceResolver(entry, this)
        const split = entry.name.split('/')
        this.name = split[1]
        this.vendor = split[0]
    }

    public async load() {
        this.resolver.load()
    }

    public async extract(hash: string) {
        await this.resolver.extract(hash)
    }
}
