"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const semver_1 = require("semver");
const version_1 = require("./version");
class VersionRange {
    constructor(range) {
        this.tags = [];
        const ranges = range.split('||');
        this.semverMatcher =
            ranges
                .filter(r => semver_1.validRange(r))
                .map(r => r.trimRight())
                .join(' ||') || undefined;
        this.tags = ranges
            .filter(r => !semver_1.validRange(r))
            .map(r => r.trim())
            .filter(r => version_1.areAllowedTagCharacters(r));
    }
    satisfies(version) {
        const semVersion = version instanceof version_1.Version ? version : new version_1.Version(version);
        if (semVersion.isTag) {
            return this.tags.filter(x => x === semVersion.tag).length > 0;
        }
        else if (semVersion.semver) {
            return semver_1.satisfies(semVersion.semver, this.semverMatcher, true);
        }
        // should never reach this
        return false;
    }
}
exports.VersionRange = VersionRange;
//# sourceMappingURL=range.js.map