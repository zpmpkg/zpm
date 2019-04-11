"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const axioms_1 = require("@zefiros/axioms");
function isGitPackageEntry(entry) {
    return lodash_1.has(entry, 'name') && axioms_1.get(entry, ['name']).indexOf(':') === -1 && !lodash_1.has(entry, 'path');
}
exports.isGitPackageEntry = isGitPackageEntry;
function isPathPackageEntry(entry) {
    return lodash_1.has(entry, 'path') || (lodash_1.has(entry, 'name') && axioms_1.get(entry, ['name']).indexOf(':') !== -1);
}
exports.isPathPackageEntry = isPathPackageEntry;
//# sourceMappingURL=package.js.map