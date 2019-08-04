import { isUndefined } from 'util'
import { Manifest } from '~/registry/package'
import {
    GDGSPackage,
    GSSubPackage,
    IPackage,
    PackageInfo,
    PackageVersion,
    PDGSPackage,
    PDPSPackage,
    PSSubPackage,
} from './internal'
import { PackageType } from './type'
import { GDSubGSPackage } from './gdsubgs';

export class Package {
    public readonly manifest: Manifest
    public readonly impl: IPackage
    public readonly info: PackageInfo

    public versions?: PackageVersion[] = undefined
    public loaded: boolean = false

    constructor(manifest: Manifest, info: PackageInfo) {
        this.manifest = manifest
        this.info = info
        this.impl = this.createPackageType()
    }
    public createPackageType(): IPackage {
        switch (this.info.type) {
            case PackageType.PDPS:
                return new PDPSPackage(this)
            case PackageType.PDGS:
                return new PDGSPackage(this)
  
            // case PackageType.GDPS:
            //     return new GDPSPackage(this)
            case PackageType.PSSub:
                return new PSSubPackage(this)
            case PackageType.GSSub:
                return new GSSubPackage(this)
            case PackageType.GDGS:
                return new GDGSPackage(this)
            case PackageType.GDSubGS:
                return new GDSubGSPackage(this)

            default:
                throw new Error(`${this.info.type} not implemented`)
        }
    }

    public async load(): Promise<boolean> {
        if (!this.loaded) {
            this.loaded = await this.impl.load()
        }
        return this.loaded
    }

    public async getVersions(): Promise<PackageVersion[]> {
        if (isUndefined(this.versions)) {
            await this.impl.load()

            this.versions = (await this.impl.getVersions()).map(v => {
                const version = new PackageVersion(v)
                v.version = version
                return version
            })
        }
        return this.versions
    }

    public get id(): string {
        return this.info.id
    }
}
