"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axioms_1 = require("@zefiros/axioms");
const lodash_1 = require("lodash");
const internal_1 = require("../../package/internal");
function getEntries(pkg, manifest, type, pkgType, parent) {
    const requiredValues = axioms_1.get(pkg, ['requires', type], []);
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
    return lodash_1.flatten(values.map(v => internal_1.transformToInternalDefinitionEntry(v, manifest, type, parent)));
}
exports.getEntries = getEntries;
function addDevelopmentPackages(values, manifest, info, pkg, type, parent) {
    if (info.options && info.options.allowDevelopment) {
        const development = axioms_1.get(pkg, ['development', type], []);
        const developmentArray = lodash_1.flatten((!lodash_1.isArray(development) ? [development] : development).map(d => internal_1.transformToInternalDefinitionEntry(d, manifest, type, parent)));
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
function setDefaults(values, manifest, pkgType, pkg, type, parent) {
    if (lodash_1.isEmpty(values) && axioms_1.isDefined((manifest.options.defaults || {})[pkgType])) {
        const defaultUsage = lodash_1.cloneDeep(manifest.options.defaults[pkgType]);
        if (manifest.options.settingsPath && pkg[manifest.options.settingsPath]) {
            // @todo correct merging of settings
            defaultUsage.settings = {
                ...defaultUsage.settings,
                ...pkg[manifest.options.settingsPath],
            };
        }
        values.push(...internal_1.transformToInternalDefinitionEntry(defaultUsage, manifest, type, parent));
    }
}
function fromPackageDefinition(pkg, info, registries, pkgType, parent) {
    const types = registries.getTypes();
    const definition = {
        packages: [],
        definition: axioms_1.omit(pkg, 'requires', 'development'),
    };
    for (const type of types) {
        const manifest = registries.getManifest(type);
        const entries = getEntries(pkg, manifest, type, pkgType, parent);
        addDevelopmentPackages(entries, manifest, info, pkg, type, parent);
        setDefaults(entries, manifest, pkgType, pkg, type, parent);
        definition.packages.push(...entries);
    }
    return definition;
}
exports.fromPackageDefinition = fromPackageDefinition;
//# sourceMappingURL=definition.js.map