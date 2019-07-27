import { satisfies, validRange } from 'semver'
import { areAllowedTagCharacters, Version } from './version'

export class VersionRange {
    public semverMatcher: string | undefined
    public tags: string[] = []

    public constructor(range: string) {
        const ranges = range.split('||')
        this.semverMatcher =
            ranges
                .filter(r => validRange(r))
                .map(r => r.trimRight())
                .join(' ||') || undefined
        this.tags = ranges
            .filter(r => !validRange(r))
            .map(r => r.trim())
            .filter(r => areAllowedTagCharacters(r))
    }

    public satisfies(version: Version | string): boolean {
        const semVersion: Version = version instanceof Version ? version : new Version(version)

        if (semVersion.isTag) {
            return this.tags.filter(x => x === semVersion.tag).length > 0
        } else if (semVersion.semver) {
            return satisfies(semVersion.semver, this.semverMatcher!, true)
        }
        // should never reach this
        return false
    }
}
