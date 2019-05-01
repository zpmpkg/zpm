import findVersions from 'find-versions'
import { first } from 'lodash'
import { SemVer } from 'semver'
import { isDefined } from './util'

export interface VersionOptions {
    cost?: number
}

export class Version {
    public raw: string | undefined
    public semver: SemVer | undefined
    public tag: string | undefined
    public cost!: number
    public isTag: boolean = false
    public constructor(version: string | undefined, options?: VersionOptions) {
        const coptions = options || {}
        this.raw = version
        if (isDefined(version)) {
            const found = first(findVersions(version, { loose: true }))
            this.semver = found ? new SemVer(found, { includePrerelease: true }) : undefined
            if (!isDefined(this.semver)) {
                version = version.trim()
                if (areAllowedTagCharacters(version)) {
                    this.tag = version
                    this.isTag = true
                    this.cost = isDefined(coptions.cost) ? coptions.cost : 0
                } else {
                    throw new TypeError(
                        `Could not convert '${JSON.stringify(version)}' to a version`
                    )
                }
            } else {
                this.cost = Math.trunc(
                    100000000 -
                        (this.semver.major * 1000000 + this.semver.minor * 1000 + this.semver.patch)
                )
            }
        }
    }

    public toString(): string {
        if (this.isTag) {
            return this.tag!
        }
        return this.semver!.toString()
    }
}

export function areAllowedTagCharacters(r: string) {
    return /^[a-zA-Z0-9\/\-_\.]+$/.test(r)
}
