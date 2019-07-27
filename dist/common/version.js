"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const find_versions_1 = __importDefault(require("find-versions"));
const lodash_1 = require("lodash");
const semver_1 = require("semver");
const util_1 = require("./util");
class Version {
    constructor(version, options) {
        this.isTag = false;
        const coptions = options || {};
        this.raw = version;
        if (util_1.isDefined(version)) {
            const found = lodash_1.first(find_versions_1.default(this.translatePrerelease(version), { loose: true }));
            found;
            version;
            this.semver = found ? new semver_1.SemVer(found, { includePrerelease: true }) : undefined;
            if (!util_1.isDefined(this.semver)) {
                version = version.trim();
                if (areAllowedTagCharacters(version)) {
                    this.tag = version;
                    this.isTag = true;
                    this.cost = util_1.isDefined(coptions.cost) ? coptions.cost : 0;
                }
                else {
                    throw new TypeError(`Could not convert '${JSON.stringify(version)}' to a version`);
                }
            }
            else {
                this.cost = Math.trunc(Version.versionInverse -
                    (this.semver.major * Version.majorVersionCost +
                        this.semver.minor * Version.minorVersionCost +
                        this.semver.patch));
            }
        }
    }
    toString() {
        if (this.isTag) {
            return this.tag;
        }
        return this.semver.toString();
    }
    translatePrerelease(version) {
        return version.replace('.beta', '-beta').replace('.alpha', '-alpha');
    }
}
Version.versionInverse = 100000000;
Version.majorVersionCost = 1000000;
Version.minorVersionCost = 1000;
exports.Version = Version;
function areAllowedTagCharacters(r) {
    return /^[a-zA-Z0-9\/\-_\.]+$/.test(r);
}
exports.areAllowedTagCharacters = areAllowedTagCharacters;
//# sourceMappingURL=version.js.map