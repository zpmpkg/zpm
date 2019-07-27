"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axioms_1 = require("@zefiros/axioms");
const is_git_url_1 = __importDefault(require("is-git-url"));
const lodash_1 = require("lodash");
const upath_1 = require("upath");
const util_1 = require("util");
const range_1 = require("../common/range");
const util_2 = require("../common/util");
const internal_1 = require("./internal");
const entryType_1 = require("./entryType");
const info_1 = require("./info");
function transformToInternalEntry(entry) {
    if (lodash_1.has(entry, 'path') && lodash_1.has(entry, 'repository')) {
        const pdgsEntry = entry;
        const split = pdgsEntry.name.split('/');
        return {
            //type: InternalEntryType.PDGS,
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
            //type: InternalEntryType.GDGS,
            vendor: split[0],
            name: split[1],
            repository: gdgsEntry.repository,
            definition: gdgsEntry.definition,
        };
    }
    if (!lodash_1.has(entry, 'name') && lodash_1.has(entry, 'definition') && lodash_1.has(entry, 'path')) {
        return {
            //type: InternalEntryType.GDPS,
            ...entry,
        };
    }
    if (!lodash_1.has(entry, 'name') && lodash_1.has(entry, 'path')) {
        return {
            //type: InternalEntryType.PDPS,
            ...entry,
        };
    }
    // if (has(entry, 'name') || (has(entry, 'path') || varget(entry, ['path'])!.includes(':'))) {
    //     const subentry = entry as RegistryPSSubEntry
    //     if (varget(subentry, ['path'])!.includes(':'))) {
    //         return {
    //             type: InternalEntryType.PSSub,
    //             ...(subentry as RegistryPSSubEntry),
    //         }
    //     }
    //     else {
    //         return {
    //             type: InternalEntryType.PSSub,
    //             ...(entry as RegistryPSSubEntry),
    //         }
    //     }
    // }
    throw new Error('not implemented');
}
exports.transformToInternalEntry = transformToInternalEntry;
function getInternalDefinitionEntryType(entry) {
    const gssubEntry = entry;
    if (lodash_1.has(gssubEntry, 'name') && lodash_1.has(gssubEntry, 'version')) {
        const hasColon = gssubEntry.name.includes(':');
        if (hasColon || gssubEntry.path) {
            return "GSSub" /* GSSub */;
        }
    }
    const pssubEntry = entry;
    if ((lodash_1.has(pssubEntry, 'name') || lodash_1.has(pssubEntry, 'path')) &&
        !lodash_1.has(pssubEntry, 'repository') &&
        !lodash_1.has(pssubEntry, 'definition')) {
        const hasColon = (pssubEntry.name || '').includes(':');
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
    // PDPS is always defined manually and not from a definition
    if (!lodash_1.has(entry, 'path')) {
        return "PDPS" /* PDPS */;
    }
    throw Error('This should never be called');
}
exports.getInternalDefinitionEntryType = getInternalDefinitionEntryType;
function internalDefinitionSubToInternalEntry(definition) {
    // if (isInternalGSSub(definition)) {
    //     return
    // } else
    if (internal_1.isInternalPSSub(definition) && definition.options) {
        const entry = {
            name: definition.options.rootName,
            path: definition.entry.path,
        };
        return entry;
    }
    if (entryType_1.isInternalGSSub(definition) && definition.options) {
        const entry = {
            name: definition.options.packageName,
            vendor: definition.options.packageVendor,
            path: definition.entry.path,
            repository: definition.entry.repository,
        };
        return entry;
    }
    throw new Error('Failed to convert entry');
}
exports.internalDefinitionSubToInternalEntry = internalDefinitionSubToInternalEntry;
function overrideInternalDefinitionToInternalEntry(definition, overriding) {
    if (entryType_1.isInternalPDGS(definition) &&
        (!util_2.isDefined(overriding) ||
            (util_2.isDefined(overriding) && (info_1.isPDGS(overriding) || info_1.isGDGS(overriding))))) {
        if (!util_2.isDefined(overriding) && !util_2.isDefined(definition.entry.repository)) {
            throw new Error();
            // @todo
        }
        const entry = {
            vendor: definition.entry.vendor || axioms_1.get(overriding, ['entry', 'vendor']),
            name: definition.entry.name,
            repository: definition.entry.repository || axioms_1.get(overriding, ['entry', 'repository']),
            definition: definition.entry.definition ||
                axioms_1.get(overriding, ['entry', 'definition']) ||
                definition.entry.repository ||
                axioms_1.get(overriding, ['entry', 'repository']),
        };
        return entry;
    }
    throw new Error('Failed to convert entry');
}
exports.overrideInternalDefinitionToInternalEntry = overrideInternalDefinitionToInternalEntry;
function overrideInternalDefinitionOptions(coptions, definition, addedBy) {
    if (entryType_1.isInternalPDGS(definition)) {
        const options = {
            ...coptions,
            rootDirectory: addedBy.directories.definition,
            rootName: addedBy.alias || addedBy.name,
        };
        return options;
    }
    throw new Error('Failed to convert entry');
}
exports.overrideInternalDefinitionOptions = overrideInternalDefinitionOptions;
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
        fullName: vendorName,
        path,
    };
}
exports.splitVendorNameWithPath = splitVendorNameWithPath;
function transformToInternalDefinitionEntry(entry, manifest, type, parent) {
    const entryType = getInternalDefinitionEntryType(entry);
    switch (entryType) {
        case "PSSub" /* PSSub */: {
            const pssubEntry = entry;
            let options;
            let split;
            let subPath = './';
            if (util_2.isDefined(pssubEntry.name)) {
                split = splitVendorNameWithPath(pssubEntry.name);
                const namedParent = manifest.searchByName(split.name);
                if (!namedParent) {
                    throw new Error('parent not found');
                    // @todo
                }
                options = {
                    allowDevelopment: axioms_1.get(namedParent.info.options, ['allowDevelopment'], false),
                    mayChangeRegistry: false,
                    rootName: split.name,
                    rootDirectory: namedParent.info.directories.source,
                    subPath,
                };
            }
            else if (info_1.isPDGS(parent.package.info)) {
                split = {
                    vendor: parent.package.info.entry.vendor,
                    name: parent.package.info.entry.name,
                };
                options = {
                    allowDevelopment: axioms_1.get(parent.package.info.options, ['allowDevelopment'], false),
                    mayChangeRegistry: axioms_1.get(parent.package.info.options, ['mayChangeRegistry'], false),
                    rootName: parent.package.info.name,
                    rootDirectory: parent.package.info.options.rootDirectory,
                    subPath,
                };
            }
            else {
                if (!internal_1.isPDPS(parent.package.info) &&
                    !internal_1.isPSSub(parent.package.info) &&
                    !info_1.isGSSub(parent.package.info)) {
                    throw new Error(`Parent package should have been PDPS or PSSub or GSSub`);
                }
                subPath = axioms_1.varget(parent.package.info.options, ['subPath'], './');
                split = splitVendorNameWithPath(parent.package.info.options.rootName);
                options = {
                    allowDevelopment: axioms_1.get(parent.package.info.options, ['allowDevelopment'], false),
                    mayChangeRegistry: axioms_1.get(parent.package.info.options, ['mayChangeRegistry'], false),
                    rootName: parent.package.info.options.rootName,
                    rootDirectory: parent.package.info.options.rootDirectory,
                    subPath,
                };
            }
            options.subPath = upath_1.toUnix(upath_1.normalizeTrim(upath_1.join(subPath, split.path || pssubEntry.path || ''))).replace(/^\.\//, '');
            const internal = {
                internalDefinitionType: entryType,
                root: {
                    vendor: split.vendor,
                    name: split.name,
                },
                entry: {
                    path: options.subPath,
                },
                options,
                type,
                usage: {
                    optional: util_2.isDefined(pssubEntry.optional) ? pssubEntry.optional : false,
                    settings: pssubEntry.settings || {},
                },
            };
            return [internal];
        }
        case "GSSub" /* GSSub */: {
            const gssubEntry = entry;
            const split = splitVendorNameWithPath(gssubEntry.name);
            if (!split.fullName) {
                throw new Error('parent not found');
                // @todo
            }
            const namedParent = manifest.searchByName(split.fullName);
            if (!namedParent || !info_1.isGDGS(namedParent.info)) {
                throw new Error('parent not found');
                // @todo
            }
            const subPath = axioms_1.varget(namedParent.info.options, ['subPath'], './');
            const internal = {
                internalDefinitionType: entryType,
                root: {
                    version: gssubEntry.version,
                    vendor: split.vendor,
                    name: split.name,
                },
                entry: {
                    path: upath_1.toUnix(upath_1.normalizeTrim(split.path || gssubEntry.path || '')).replace(/^\.\//, ''),
                    repository: namedParent.info.entry.repository,
                },
                options: {
                    allowDevelopment: false,
                    mayChangeRegistry: axioms_1.get(parent.package.info.options, ['mayChangeRegistry'], false),
                    rootName: axioms_1.varget(parent.package.info.options, ['rootName']),
                    rootDirectory: parent.package.info.directories.definition,
                    packageName: namedParent.info.entry.name,
                    packageVendor: namedParent.info.entry.vendor,
                    packageDirectory: namedParent.info.directories.source,
                    subPath: upath_1.toUnix(upath_1.normalizeTrim(upath_1.join(subPath, split.path || gssubEntry.path || ''))).replace(/^\.\//, ''),
                },
                type,
                usage: {
                    optional: util_2.isDefined(gssubEntry.optional) ? gssubEntry.optional : false,
                    settings: gssubEntry.settings || {},
                },
            };
            const rootEntry = {
                name: split.fullName,
                version: internal.root.version,
            };
            return [
                ...transformToInternalDefinitionEntry(rootEntry, manifest, type, parent),
                internal,
            ];
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
                    version: new range_1.VersionRange(gdgsEntry.version),
                    optional: util_2.isDefined(gdgsEntry.optional) ? gdgsEntry.optional : false,
                    settings: gdgsEntry.settings || {},
                },
            };
            return [internal];
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
            return [internal];
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
                    version: new range_1.VersionRange(pdgsEntry.version),
                    optional: util_2.isDefined(pdgsEntry.optional) ? pdgsEntry.optional : false,
                    settings: pdgsEntry.settings || {},
                },
            };
            return [internal];
        }
        case "PDPS" /* PDPS */: {
            const pdpsEntry = entry;
            const internal = {
                internalDefinitionType: entryType,
                entry: {},
                type,
                usage: {
                    optional: util_2.isDefined(pdpsEntry.optional) ? pdpsEntry.optional : false,
                    settings: pdpsEntry.settings || {},
                },
            };
            return [internal];
        }
    }
}
exports.transformToInternalDefinitionEntry = transformToInternalDefinitionEntry;
//# sourceMappingURL=entry.js.map