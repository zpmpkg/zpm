"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axioms_1 = require("@zefiros/axioms");
const lodash_1 = require("lodash");
const git_1 = require("../../common/git");
const version_1 = require("../../common/version");
async function listGitVersions(directory) {
    const output = await git_1.showRef(directory);
    const versions = output
        .split('\n')
        .map(s => s.split(' '))
        .filter(s => s.length === 2)
        .map(s => {
        let result;
        try {
            if (s[1].includes('/tags/')) {
                result = {
                    version: new version_1.Version(s[1].replace('refs/tags/', '')),
                    hash: s[0],
                    name: s[1].replace('refs/tags/', ''),
                };
            }
            else if (s[1].includes('/remotes/')) {
                result = {
                    version: new version_1.Version(s[1].replace('refs/remotes/origin/', '')),
                    hash: s[0],
                    name: s[1].replace('refs/remotes/origin/', ''),
                };
            }
        }
        catch (error) {
            result = undefined;
        }
        return result;
    })
        .filter(axioms_1.isDefined)
        .sort((a, b) => b.version.cost - a.version.cost)
        .reverse();
    const fversions = lodash_1.reject(versions, (object, i) => {
        return i > 0 && versions[i - 1].version.toString() === object.version.toString();
    });
    return fversions;
}
exports.listGitVersions = listGitVersions;
//# sourceMappingURL=git.js.map