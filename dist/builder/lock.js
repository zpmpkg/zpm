"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
function isPathLock(entry) {
    return !lodash_1.has(entry, 'hash');
}
exports.isPathLock = isPathLock;
function isNamedLock(entry) {
    return lodash_1.has(entry, 'hash');
}
exports.isNamedLock = isNamedLock;
//# sourceMappingURL=lock.js.map