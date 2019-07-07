import { join } from 'upath'
import { environment } from '~/common/environment'
import { Package } from '~/registry/package'
import { NamedLock, PathLock } from '~/types/lockfile.v1'
import { Builder } from './builder'
import { isNamedLock } from './lock'

export interface BuilderOptions {
    root?: BasePackageBuilder
    type: PackageType
}

export class BasePackageBuilder {
    public lock: NamedLock | PathLock
    public package: Package
    public options: BuilderOptions
    public builder: Builder
    public used: boolean = false

    public constructor(
        builder: Builder,
        pkg: Package,
        lock: NamedLock | PathLock,
        options: Partial<BuilderOptions> = {}
    ) {
        this.builder = builder
        this.package = pkg
        this.lock = lock
        this.options = {
            type: PackageType.PATH,
            ...options,
        }
    }

    public async build(type: string): Promise<boolean> {
        if (this.lock.usage && this.lock.usage.required && this.lock.usage.required[type]) {
            const locked: string = this.lock.usage.required[type] as string
            if (this.builder.builders[locked]) {
                this.builder.builders[locked].used = true
                return this.builder.builders[locked].run(this)
            }
        }
        return false
    }

    public getTargetPath(): string {
        return join(
            environment.directory.extract,
            this.package.manifest.type,
            this.package.vendor,
            this.package.name
        )
    }

    public getHash() {
        return isNamedLock(this.lock) ? this.lock.hash : undefined
    }
}

export class PackageBuilder extends BasePackageBuilder {
    public async run(target: BasePackageBuilder): Promise<boolean> {
        return true
    }
    public async finish(): Promise<boolean> {
        return true
    }
}
