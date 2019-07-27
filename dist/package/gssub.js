"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axioms_1 = require("@zefiros/axioms");
const logger_1 = require("../common/logger");
const version_1 = require("../common/version");
const path_1 = require("../resolver/definition/path");
const internal_1 = require("./internal");
const repository_1 = require("./repository");
const upath_1 = require("upath");
const environment_1 = require("../common/environment");
class GSSubPackageVersion extends internal_1.IPackageVersion {
    async getDefinition(parent) {
        logger_1.logger.logfile.info(`Trying to read '${this.package.info.entry.path}' from '${this.package.info.directories.definition}`);
        return path_1.getPathPackageDefinition(this.package, parent);
    }
    getCost() {
        return version_1.Version.versionInverse - version_1.Version.majorVersionCost;
    }
    getTargetPath() {
        return this.getBuildPath();
    }
    getBuildPath() {
        return upath_1.join(environment_1.environment.directory.extract, this.package.info.manifest, this.package.info.entry.vendor, this.package.info.entry.name);
    }
    get package() {
        return this._package;
    }
    addUsage(usage) {
        const entry = usage.entry;
        if (!axioms_1.isDefined(this.version.usedBy[usage.addedBy.id])) {
            this.version.usedBy[usage.addedBy.id] = {
                settings: entry.usage.settings,
                optional: axioms_1.isDefined(entry.usage.optional) ? entry.usage.optional : false,
            };
        }
        return true;
    }
}
exports.GSSubPackageVersion = GSSubPackageVersion;
class GSSubPackage extends internal_1.IPackage {
    async load() {
        await repository_1.createRepository(this.info.directories.source, this.info.entry.repository).cloneOrFetch(`repository '${this.info.name}'`);
        return true;
    }
    async getVersions() {
        return [new GSSubPackageVersion(this, this.id)];
    }
    get info() {
        return this.package.info;
    }
}
exports.GSSubPackage = GSSubPackage;
//# sourceMappingURL=gssub.js.map