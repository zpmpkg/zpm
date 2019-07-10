"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axioms_1 = require("@zefiros/axioms");
const get_1 = require("@zefiros/axioms/get");
const is_git_url_1 = __importDefault(require("is-git-url"));
const lodash_1 = require("lodash");
const upath_1 = require("upath");
const environment_1 = require("../common/environment");
const util_1 = require("../common/util");
const entry_1 = require("./entry");
function classifyType(entry) {
    const gdgsEntry = entry;
    if (lodash_1.has(entry, 'name') &&
        lodash_1.has(entry, 'vendor') &&
        is_git_url_1.default(gdgsEntry.repository) &&
        ((axioms_1.isDefined(gdgsEntry.definition) && is_git_url_1.default(gdgsEntry.definition)) ||
            lodash_1.isUndefined(gdgsEntry.definition)) &&
        !lodash_1.has(entry, 'path')) {
        return "GDGS" /* GDGS */;
    }
    if (lodash_1.has(entry, 'name') &&
        lodash_1.has(entry, 'vendor') &&
        lodash_1.has(entry, 'repository') &&
        lodash_1.has(entry, 'definition')) {
        return "PDGS" /* PDGS */;
    }
    const gdpsEntry = entry;
    if (!lodash_1.has(entry, 'name') &&
        lodash_1.has(entry, 'path') &&
        axioms_1.isDefined(gdpsEntry.definition) &&
        is_git_url_1.default(gdpsEntry.definition)) {
        return "GDPS" /* GDPS */;
    }
    if (lodash_1.has(entry, 'path') && lodash_1.has(entry, 'name')) {
        return "PSSub" /* PSSub */;
    }
    if (lodash_1.has(entry, 'path')) {
        return "PDPS" /* PDPS */;
    }
    throw Error('This should never be called');
}
exports.classifyType = classifyType;
exports.isPackageInfo = (condition) => (entry) => entry.type === condition;
exports.isGDGS = exports.isPackageInfo("GDGS" /* GDGS */);
exports.isPDPS = exports.isPackageInfo("PDPS" /* PDPS */);
exports.isPDGS = exports.isPackageInfo("PDGS" /* PDGS */);
exports.isGDPS = exports.isPackageInfo("GDPS" /* GDPS */);
exports.isPSSub = exports.isPackageInfo("PSSub" /* PSSub */);
function getId(info, type) {
    if (exports.isPDPS(info) && info.options) {
        return `${type}:${info.options.rootName}:${info.entry.path}`;
    }
    else if (exports.isPSSub(info) && info.options) {
        return `${type}:${info.options.rootName}:${info.entry.path}`;
    }
    else if (exports.isGDGS(info)) {
        return `${type}:${info.entry.name}`;
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
    else if (exports.isPSSub(info) && info.options) {
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
function getNameFromEntry(entry) {
    if (entry_1.isInternalPDPS(entry) && entry.options) {
        return `${entry.options.rootName}:${entry.entry.path}`;
    }
    else if (entry_1.isInternalPSSub(entry)) {
        const rootName = entry.root.vendor
            ? `${entry.root.vendor}/${entry.root.name}`
            : entry.root.name;
        return `${rootName}:${entry.entry.path}`;
    }
    else if (entry_1.isInternalGDGS(entry)) {
        if (entry.entry.vendor) {
            return `${entry.entry.vendor}/${entry.entry.name}`;
        }
        return `${entry.entry.name}`;
    }
    else {
        throw Error('not implemented');
    }
    return '';
}
exports.getNameFromEntry = getNameFromEntry;
function getAlias(info) {
    if (exports.isPDPS(info)) {
        return get_1.get(info, ['options', 'alias']);
    }
    else if (exports.isPSSub(info)) {
        return undefined;
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
    else if (exports.isPSSub(info) && info.options) {
        const sub = upath_1.join(info.options.rootDirectory, info.entry.path);
        return {
            definition: sub,
            source: sub,
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
function getPackageInfo(entry, type, pkgType, options) {
    const info = {
        entry,
        manifest: type,
        type: pkgType,
        options,
    };
    return {
        ...info,
        name: getName(info),
        alias: getAlias(info),
        directories: getDirectories(info),
        id: getId(info, type),
    };
}
exports.getPackageInfo = getPackageInfo;
// export function composeEntry(entry: InternalDefinitionEntry): ComposedEntry {
//     const entryType = getInternalEntryType(entry)
//     switch (entryType) {
//         case InternalEntryType.GDGS:
//             return {
//                 type: entryType,
//                 usage: entry,
//                 registry: undefined,
//                 mayBeRegistered: false,
//             }
//         case InternalEntryType.GDPS: {
//             const gdps = entry as InternalDefinitionGDPSEntry
//             const internal: InternalGDPSEntry = {
//                 path: gdps.path,
//                 definition: gdps.definition,
//             }
//             return {
//                 type: entryType,
//                 usage: entry,
//                 registry: internal,
//                 mayBeRegistered: true,
//             }
//         }
//         case InternalEntryType.PDGS: {
//             const pdgs = entry as InternalDefinitionPDGSEntry
//             const internal: InternalPDGSEntry = {
//                 name: pdgs.name,
//                 vendor: pdgs.vendor,
//                 repository: pdgs.repository,
//                 definition: pdgs.definition,
//             }
//             return {
//                 type: entryType,
//                 usage: entry,
//                 registry: internal,
//                 mayBeRegistered: true,
//             }
//         }
//         case InternalEntryType.PDPS: {
//             return {
//                 type: entryType,
//                 usage: entry,
//                 registry: undefined,
//                 mayBeRegistered: false,
//             }
//         }
//     }
// }
//# sourceMappingURL=info.js.map