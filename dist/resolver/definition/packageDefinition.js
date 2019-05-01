"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axioms_1 = require("@zefiros/axioms");
const lodash_1 = require("lodash");
const util_1 = require("../../common/util");
const package_1 = require("../../solver/package");
function fromPackageDefinition(pkg, definitionPath, options, registries, pkgType) {
    const types = registries.getTypes();
    const definition = {
        packages: {
            path: {},
            named: {},
        },
        description: axioms_1.omit(pkg, 'requires', 'development'),
        definitionPath,
    };
    lodash_1.forEach(types, type => {
        const manifest = registries.getManifest(type);
        const requiredValues = axioms_1.get(pkg, ['requires', type], []);
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
        if (options.isRoot || (options.root && options.root.options.isRoot)) {
            const development = axioms_1.get(pkg, ['development', type], []);
            const developmentArray = !lodash_1.isArray(development) ? [development] : development;
            for (const entry of developmentArray) {
                const match = lodash_1.findIndex(values, o => util_1.isDefined(o.name) && o.name === entry.name);
                if (match >= 0) {
                    values[match] = entry;
                }
                else {
                    values.push(entry);
                }
            }
        }
        if (lodash_1.isEmpty(values) && util_1.isDefined((manifest.options.defaults || {})[pkgType])) {
            const defaultUsage = lodash_1.cloneDeep(manifest.options.defaults[pkgType]);
            if (manifest.options.settingsPath && pkg[manifest.options.settingsPath]) {
                // @todo correct merging of settings
                defaultUsage.settings = Object.assign({}, defaultUsage.settings, pkg[manifest.options.settingsPath]);
            }
            values.push(defaultUsage);
        }
        lodash_1.forEach(values, entry => {
            if (package_1.isPathPackageEntry(entry)) {
                if (!util_1.isDefined(definition.packages.path[type])) {
                    definition.packages.path[type] = [];
                }
                definition.packages.path[type].push({
                    name: entry.name,
                    path: entry.path,
                    version: entry.version,
                    settings: entry.settings || {},
                    isBuildDefinition: manifest.options.isBuildDefinition,
                });
            }
            else if (package_1.isGitPackageEntry(entry)) {
                if (!util_1.isDefined(definition.packages.named[type])) {
                    definition.packages.named[type] = [];
                }
                definition.packages.named[type].push({
                    name: entry.name,
                    version: entry.version,
                    definition: entry.definition,
                    repository: entry.repository,
                    settings: entry.settings || {},
                    isBuildDefinition: manifest.options.isBuildDefinition,
                });
            }
        });
    });
    return definition;
}
exports.fromPackageDefinition = fromPackageDefinition;
//# sourceMappingURL=packageDefinition.js.map