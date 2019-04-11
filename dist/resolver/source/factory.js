"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const gitSourceResolver_1 = require("./gitSourceResolver");
const pathSourceResolver_1 = require("./pathSourceResolver");
function isNamedEntry(entry) {
    return lodash_1.has(entry, 'repository') && !lodash_1.has(entry, 'path');
}
exports.isNamedEntry = isNamedEntry;
function isPathEntry(entry) {
    return lodash_1.has(entry, 'name') || lodash_1.has(entry, 'path');
}
exports.isPathEntry = isPathEntry;
function createSourceResolver(entry, pkg) {
    if (isNamedEntry(entry)) {
        return new gitSourceResolver_1.GitSourceResolver(entry.repository, entry.definition, pkg);
    }
    else if (isPathEntry(entry)) {
        return new pathSourceResolver_1.PathSourceResolver(entry.path, entry.path, pkg);
    }
    else {
        throw new Error(`Failed to determine solver type ${JSON.stringify(entry)}`);
    }
}
exports.createSourceResolver = createSourceResolver;
//# sourceMappingURL=factory.js.map