"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const is_git_url_1 = __importDefault(require("is-git-url"));
const lodash_1 = require("lodash");
const upath_1 = require("upath");
const util_1 = require("util");
const util_2 = require("../common/util");
const axioms_1 = require("@zefiros/axioms");
function transformToInternalEntry(entry) {
    if (lodash_1.has(entry, 'path') && lodash_1.has(entry, 'repository')) {
        const pdgsEntry = entry;
        const split = pdgsEntry.name.split('/');
        return {
            vendor: split[0],
            name: split[1],
            repository: pdgsEntry.repository,
            definition: pdgsEntry.definition,
        };
    }
    const gdgsEntry = entry;
    if (lodash_1.has(entry, 'name') && util_2.isDefined(gdgsEntry.repository) && is_git_url_1.default(gdgsEntry.repository)) {
        const split = gdgsEntry.name.split('/');
        return {
            vendor: split[0],
            name: split[1],
            repository: gdgsEntry.repository,
            definition: gdgsEntry.definition,
        };
    }
    if (!lodash_1.has(entry, 'name') && lodash_1.has(entry, 'definition') && lodash_1.has(entry, 'path')) {
        return entry;
    }
    if (!lodash_1.has(entry, 'name') && lodash_1.has(entry, 'path')) {
        return entry;
    }
    if (lodash_1.has(entry, 'name') || (lodash_1.has(entry, 'path') || axioms_1.varget(entry, ['path']).includes(':'))) {
        return entry;
    }
    return entry;
}
exports.transformToInternalEntry = transformToInternalEntry;
exports.isInternalDefinitionEntry = (condition) => (entry) => entry.internalDefinitionType === condition;
exports.isInternalGDGS = exports.isInternalDefinitionEntry("GDGS" /* GDGS */);
exports.isInternalPDPS = exports.isInternalDefinitionEntry("PDPS" /* PDPS */);
exports.isInternalPDGS = exports.isInternalDefinitionEntry("PDGS" /* PDGS */);
exports.isInternalGDPS = exports.isInternalDefinitionEntry("GDPS" /* GDPS */);
exports.isInternalGSSub = exports.isInternalDefinitionEntry("GSSub" /* GSSub */);
exports.isInternalPSSub = exports.isInternalDefinitionEntry("PSSub" /* PSSub */);
function getInternalDefinitionEntryType(entry) {
    const gssubEntry = entry;
    if (lodash_1.has(gssubEntry, 'name') && lodash_1.has(gssubEntry, 'version')) {
        const hasColon = gssubEntry.name.includes(':');
        if (hasColon || gssubEntry.path) {
            return "GSSub" /* GSSub */;
        }
    }
    const pssubEntry = entry;
    if (lodash_1.has(pssubEntry, 'name')) {
        const hasColon = pssubEntry.name.includes(':');
        if (hasColon || pssubEntry.path) {
            return "PSSub" /* PSSub */;
        }
    }
    const gdgsEntry = entry;
    if (lodash_1.has(entry, 'name') &&
        ((util_2.isDefined(gdgsEntry.repository) && is_git_url_1.default(gdgsEntry.repository)) ||
            util_1.isUndefined(gdgsEntry.repository)) &&
        ((util_2.isDefined(gdgsEntry.definition) && is_git_url_1.default(gdgsEntry.definition)) ||
            util_1.isUndefined(gdgsEntry.definition))) {
        return "GDGS" /* GDGS */;
    }
    if (lodash_1.has(entry, 'name') && lodash_1.has(entry, 'definition')) {
        return "PDGS" /* PDGS */;
    }
    const gdpsEntry = entry;
    if (!lodash_1.has(entry, 'name') &&
        lodash_1.has(entry, 'path') &&
        util_2.isDefined(gdpsEntry.definition) &&
        is_git_url_1.default(gdpsEntry.definition)) {
        return "GDPS" /* GDPS */;
    }
    if (lodash_1.has(entry, 'path')) {
        return "PDPS" /* PDPS */;
    }
    throw Error('This should never be called');
}
exports.getInternalDefinitionEntryType = getInternalDefinitionEntryType;
function getInternalEntryType(entry) {
    const gdgsEntry = entry;
    if (lodash_1.has(entry, 'name') &&
        lodash_1.has(entry, 'vendor') &&
        ((util_2.isDefined(gdgsEntry.repository) && is_git_url_1.default(gdgsEntry.repository)) ||
            util_1.isUndefined(gdgsEntry.repository)) &&
        ((util_2.isDefined(gdgsEntry.definition) && is_git_url_1.default(gdgsEntry.definition)) ||
            util_1.isUndefined(gdgsEntry.definition))) {
        return "GDGS" /* GDGS */;
    }
    if (lodash_1.has(entry, 'name') && lodash_1.has(entry, 'vendor') && lodash_1.has(entry, 'definition')) {
        return "PDGS" /* PDGS */;
    }
    const gdpsEntry = entry;
    if (!lodash_1.has(entry, 'name') &&
        lodash_1.has(entry, 'path') &&
        util_2.isDefined(gdpsEntry.definition) &&
        is_git_url_1.default(gdpsEntry.definition)) {
        return "GDPS" /* GDPS */;
    }
    if (lodash_1.has(entry, 'path')) {
        return "PDPS" /* PDPS */;
    }
    throw Error('This should never be called');
}
exports.getInternalEntryType = getInternalEntryType;
function splitVendorName(vendorName) {
    let [vendor, name] = vendorName.split('/');
    if (!name) {
        name = vendor;
        vendor = undefined;
    }
    return {
        vendor,
        name,
    };
}
exports.splitVendorName = splitVendorName;
function splitVendorNameWithPath(vendorName) {
    let path;
    if (vendorName.includes(':')) {
        const [name, p] = vendorName.split(':');
        if (p) {
            vendorName = name;
            path = p;
        }
    }
    return {
        ...splitVendorName(vendorName),
        path,
    };
}
exports.splitVendorNameWithPath = splitVendorNameWithPath;
function transformToInternalDefinitionEntry(entry, type) {
    const entryType = getInternalDefinitionEntryType(entry);
    switch (entryType) {
        case "PSSub" /* PSSub */: {
            const pssubEntry = entry;
            const split = splitVendorNameWithPath(pssubEntry.name);
            const internal = {
                internalDefinitionType: entryType,
                root: {
                    vendor: split.vendor,
                    name: split.name,
                },
                entry: {
                    path: upath_1.toUnix(upath_1.normalizeTrim(split.path || pssubEntry.path || '')).replace(/^\.\//, ''),
                },
                type,
                usage: {
                    optional: util_2.isDefined(pssubEntry.optional) ? pssubEntry.optional : false,
                    settings: pssubEntry.settings || {},
                },
            };
            return internal;
        }
        case "GSSub" /* GSSub */: {
            const gssubEntry = entry;
            const split = splitVendorNameWithPath(gssubEntry.name);
            const internal = {
                internalDefinitionType: entryType,
                root: {
                    version: gssubEntry.version,
                    vendor: split.vendor,
                    name: split.name,
                },
                entry: {
                    path: upath_1.toUnix(upath_1.normalizeTrim(split.path || gssubEntry.path || '')).replace(/^\.\//, ''),
                },
                type,
                usage: {
                    optional: util_2.isDefined(gssubEntry.optional) ? gssubEntry.optional : false,
                    settings: gssubEntry.settings || {},
                },
            };
            return internal;
        }
        case "GDGS" /* GDGS */: {
            const gdgsEntry = entry;
            const internal = {
                internalDefinitionType: entryType,
                entry: {
                    ...splitVendorName(gdgsEntry.name),
                    repository: gdgsEntry.repository,
                    definition: gdgsEntry.definition,
                },
                type,
                usage: {
                    version: gdgsEntry.version,
                    optional: util_2.isDefined(gdgsEntry.optional) ? gdgsEntry.optional : false,
                    settings: gdgsEntry.settings || {},
                },
            };
            return internal;
        }
        case "GDPS" /* GDPS */: {
            const gdpsEntry = entry;
            const internal = {
                internalDefinitionType: entryType,
                entry: {
                    definition: gdpsEntry.definition,
                    path: gdpsEntry.path,
                },
                type,
                usage: {
                    optional: util_2.isDefined(gdpsEntry.optional) ? gdpsEntry.optional : false,
                    settings: gdpsEntry.settings || {},
                },
            };
            return internal;
        }
        case "PDGS" /* PDGS */: {
            const pdgsEntry = entry;
            const internal = {
                internalDefinitionType: entryType,
                entry: {
                    ...splitVendorName(pdgsEntry.name),
                    repository: pdgsEntry.repository,
                    definition: pdgsEntry.definition,
                },
                type,
                usage: {
                    version: pdgsEntry.version,
                    optional: util_2.isDefined(pdgsEntry.optional) ? pdgsEntry.optional : false,
                    settings: pdgsEntry.settings || {},
                },
            };
            return internal;
        }
        case "PDPS" /* PDPS */: {
            const pdpsEntry = entry;
            const internal = {
                internalDefinitionType: entryType,
                entry: {
                    path: pdpsEntry.path,
                },
                type,
                usage: {
                    optional: util_2.isDefined(pdpsEntry.optional) ? pdpsEntry.optional : false,
                    settings: pdpsEntry.settings || {},
                },
            };
            return internal;
        }
    }
}
exports.transformToInternalDefinitionEntry = transformToInternalDefinitionEntry;
//# sourceMappingURL=entry.js.map