"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axioms_1 = require("@zefiros/axioms");
const get_1 = require("@zefiros/axioms/get");
const lodash_1 = require("lodash");
const upath_1 = require("upath");
const environment_1 = require("../common/environment");
const util_1 = require("../common/util");
function classifyType(entry) {
    if (!lodash_1.has(entry, 'name') && lodash_1.has(entry, 'path')) {
        return "PDPS" /* PDPS */;
    }
    if (lodash_1.has(entry, 'name') && lodash_1.has(entry, 'path')) {
        return "PDGS" /* PDGS */;
    }
    if (lodash_1.has(entry, 'name') && !lodash_1.has(entry, 'path')) {
        return "GDGS" /* GDGS */;
    }
    if (!lodash_1.has(entry, 'name') && lodash_1.has(entry, 'path')) {
        return "GDPS" /* GDPS */;
    }
    return "GDGS" /* GDGS */;
}
exports.classifyType = classifyType;
exports.isPackageInfo = (condition) => (entry) => entry.type === condition;
exports.isGDGS = exports.isPackageInfo("GDGS" /* GDGS */);
exports.isPDPS = exports.isPackageInfo("PDPS" /* PDPS */);
exports.isPDGS = exports.isPackageInfo("PDGS" /* PDGS */);
exports.isGDPS = exports.isPackageInfo("GDPS" /* GDPS */);
function getId(info, type) {
    if (exports.isPDPS(info) && info.options) {
        return `${type}:PDPS:${info.options.rootName}:${info.entry.path}`;
    }
    else if (exports.isGDGS(info)) {
        return `${info.entry.name}`;
    }
    else {
        throw Error('not implemented');
    }
    return '';
}
exports.getId = getId;
function getName(info) {
    if (exports.isPDPS(info) && info.options) {
        return `${info.options.rootName}:${info.entry.path}`;
    }
    else if (exports.isGDGS(info)) {
        return `${info.entry.name}`;
    }
    else {
        throw Error('not implemented');
    }
    return '';
}
exports.getName = getName;
function getAlias(info) {
    if (exports.isPDPS(info)) {
        return get_1.get(info, ['options', 'alias']);
    }
    else if (exports.isGDGS(info)) {
        return undefined;
    }
    else {
        throw Error('not implemented');
    }
    return '';
}
exports.getAlias = getAlias;
function getDirectories(info) {
    if (exports.isPDPS(info) && info.options) {
        const root = upath_1.join(info.options.rootDirectory, info.entry.path);
        return {
            definition: root,
            source: root,
        };
    }
    else if (exports.isGDGS(info)) {
        const root = upath_1.join(environment_1.environment.directory.packages, info.manifest, info.entry.vendor, info.entry.name);
        const sourceDir = upath_1.join(root, `source-${util_1.shortHash(info.entry.repository)}`);
        return {
            definition: axioms_1.isDefined(info.entry.definition) && info.entry.definition !== info.entry.repository
                ? upath_1.join(root, `definition-${util_1.shortHash(info.entry.definition)}`)
                : sourceDir,
            source: sourceDir,
        };
    }
    else {
        throw Error('not implemented');
    }
    return {
        definition: '',
        source: '',
    };
}
exports.getDirectories = getDirectories;
function getPackageInfo(entry, type, options) {
    const pkgType = classifyType(entry);
    const info = {
        entry,
        manifest: type,
        type: pkgType,
        options,
    };
    return Object.assign({}, info, { name: getName(info), alias: getAlias(info), directories: getDirectories(info), id: getId(info, type) });
}
exports.getPackageInfo = getPackageInfo;
//# sourceMappingURL=info.js.map