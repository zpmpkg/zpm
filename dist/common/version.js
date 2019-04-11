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
            const found = lodash_1.first(find_versions_1.default(version, { loose: true }));
            this.semver = found ? new semver_1.SemVer(found) : undefined;
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
                this.cost = Math.trunc(100000000 -
                    (this.semver.major * 1000000 + this.semver.minor * 1000 + this.semver.patch));
            }
        }
    }
    toString() {
        return this.isTag ? this.tag : this.semver.toString();
    }
}
exports.Version = Version;
function areAllowedTagCharacters(r) {
    return /^[a-zA-Z0-9\/\-_\.]+$/.test(r);
}
exports.areAllowedTagCharacters = areAllowedTagCharacters;
//# sourceMappingURL=version.js.map