import { get, isDefined } from '@zefiros/axioms'
import { Spinner, spinners } from '~/cli/spinner'
import { PackageVersion } from '~/package/internal'
import { VersionLock } from '~/types/lockfile.v1'
import { Builder } from './builder'

export class IBuilder {
    public versionLock: VersionLock
    public version: PackageVersion
    public builder: Builder
    public constructor(builder: Builder, version: PackageVersion, versionLock: VersionLock) {
        this.builder = builder
        this.version = version
        this.versionLock = versionLock
    }

    public async initialize(): Promise<boolean> {
        return true
    }

    public async build(): Promise<boolean> {
        return true
    }
}

export class PackageBuilder extends IBuilder {
    public spin: Spinner
    public constructor(builder: Builder, version: PackageVersion, versionLock: VersionLock) {
        super(builder, version, versionLock)

        this.spin = spinners.create({
            text: `Building '${this.version.id}':`,
        })
    }

    public finish() {
        this.spin.succeed(`Built '${this.version.id}'`)
    }

    public get targetPath() {
        return this.version.targetPath
    }
    public get buildPath() {
        return this.version.buildPath
    }

    public get sourcePath() {
        return this.version.package.info.directories.source
    }

    public get hash(): string | undefined {
        return get(this.version, ['version', 'hash'])
    }

    public get needsExtraction(): boolean {
        return isDefined(this.targetPath)
    }
}

export class TargetBuilder extends IBuilder {
    public used: boolean = false

    public blackboard: Map<string, any> = new Map()

    public getTargets(): PackageBuilder[] {
        return this.versionLock.usedBy
            .map(v => this.builder.versions.get(v.versionId))
            .filter(isDefined)
    }

    public async initialize(): Promise<boolean> {
        const targets = this.getTargets()
        for (const target of targets) {
            await this.prepare(target)
        }
        return false
    }

    public async build(): Promise<boolean> {
        const targets = this.getTargets()
        for (const target of targets) {
            const succeeded = await this.run(target)
            this.used = this.used || succeeded
        }
        return false
    }

    public store<T extends object>(target: PackageBuilder, obj: T) {
        this.blackboard.set(target.version.id, obj)
    }

    public get<T extends object>(target: PackageBuilder): T | undefined {
        return this.blackboard.get(target.version.id)
    }

    public async run(_: PackageBuilder): Promise<boolean> {
        return false
    }
    public async prepare(_: PackageBuilder): Promise<boolean> {
        return true
    }
    public async finish(): Promise<boolean> {
        return true
    }
}
