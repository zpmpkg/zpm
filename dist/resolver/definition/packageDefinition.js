"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axioms_1 = require("@zefiros/axioms");
const get_1 = require("@zefiros/axioms/get");
const omit_1 = require("@zefiros/axioms/omit");
const lodash_1 = require("lodash");
function getEntries(pkg, manifest, type, pkgType) {
    const requiredValues = get_1.get(pkg, ['requires', type], []);
    let values = [];
    if (!lodash_1.isArray(requiredValues)) {
        if (manifest.options.isBuildDefinition) {
            const defaultUsage = lodash_1.cloneDeep(manifest.options.defaults[pkgType]);
            if (manifest.options.settingsPath && pkg[manifest.options.settingsPath]) {
                // @todo correct merging of settings
                requiredValues.settings = Object.assign({}, defaultUsage.settings, pkg[manifest.options.settingsPath]);
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
    return values;
}
exports.getEntries = getEntries;
function addDevelopmentPackages(values, info, pkg, type) {
    if (info.options && info.options.allowDevelopment) {
        const development = get_1.get(pkg, ['development', type], []);
        const developmentArray = !lodash_1.isArray(development) ? [development] : development;
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
function setDefaults(values, manifest, pkgType, pkg) {
    if (lodash_1.isEmpty(values) && axioms_1.isDefined((manifest.options.defaults || {})[pkgType])) {
        const defaultUsage = lodash_1.cloneDeep(manifest.options.defaults[pkgType]);
        if (manifest.options.settingsPath && pkg[manifest.options.settingsPath]) {
            // @todo correct merging of settings
            defaultUsage.settings = Object.assign({}, defaultUsage.settings, pkg[manifest.options.settingsPath]);
        }
        values.push(defaultUsage);
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
        const values = getEntries(pkg, manifest, type, pkgType);
        addDevelopmentPackages(values, info, pkg, type);
        setDefaults(values, manifest, pkgType, pkg);
    }
    return definition;
}
exports.fromPackageDefinition = fromPackageDefinition;
//# sourceMappingURL=packageDefinition.js.map