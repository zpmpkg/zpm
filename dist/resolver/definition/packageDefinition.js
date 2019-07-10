"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axioms_1 = require("@zefiros/axioms");
const get_1 = require("@zefiros/axioms/get");
const omit_1 = require("@zefiros/axioms/omit");
const lodash_1 = require("lodash");
const entry_1 = require("../../package/entry");
function getEntries(pkg, manifest, type, pkgType) {
    const requiredValues = get_1.get(pkg, ['requires', type], []);
    let values = [];
    if (!lodash_1.isArray(requiredValues)) {
        if (manifest.options.isBuildDefinition) {
            const defaultUsage = lodash_1.cloneDeep(manifest.options.defaults[pkgType]);
            if (manifest.options.settingsPath && pkg[manifest.options.settingsPath]) {
                // @todo correct merging of settings
                requiredValues.settings = {
                    ...defaultUsage.settings,
                    ...pkg[manifest.options.settingsPath],
                };
            }
            values = [requiredValues];
        }
        else {
            // todo throw
        }
    }
    else {
        values = requiredValues;
    }
    return values.map(v => entry_1.transformToInternalDefinitionEntry(v, type));
}
exports.getEntries = getEntries;
function addDevelopmentPackages(values, info, pkg, type) {
    if (info.options && info.options.allowDevelopment) {
        const development = get_1.get(pkg, ['development', type], []);
        const developmentArray = (!lodash_1.isArray(development) ? [development] : development).map(d => entry_1.transformToInternalDefinitionEntry(d, type));
        for (const entry of developmentArray) {
            // @todo remove duplicates
            const match = -1; // findIndex(values, o => isDefined(o.name) && o.name === entry.name)
            if (match >= 0) {
                values[match] = entry;
            }
            else {
                values.push(entry);
            }
        }
    }
}
function setDefaults(values, manifest, pkgType, pkg, type) {
    if (lodash_1.isEmpty(values) && axioms_1.isDefined((manifest.options.defaults || {})[pkgType])) {
        const defaultUsage = lodash_1.cloneDeep(manifest.options.defaults[pkgType]);
        if (manifest.options.settingsPath && pkg[manifest.options.settingsPath]) {
            // @todo correct merging of settings
            defaultUsage.settings = {
                ...defaultUsage.settings,
                ...pkg[manifest.options.settingsPath],
            };
        }
        values.push(entry_1.transformToInternalDefinitionEntry(defaultUsage, type));
    }
}
function fromPackageDefinition(pkg, info, registries, pkgType) {
    const types = registries.getTypes();
    const definition = {
        packages: [],
        definition: omit_1.omit(pkg, 'requires', 'development'),
    };
    for (const type of types) {
        const manifest = registries.getManifest(type);
        const entries = getEntries(pkg, manifest, type, pkgType);
        addDevelopmentPackages(entries, info, pkg, type);
        setDefaults(entries, manifest, pkgType, pkg, type);
        definition.packages.push(...entries);
    }
    return definition;
}
exports.fromPackageDefinition = fromPackageDefinition;
//# sourceMappingURL=packageDefinition.js.map