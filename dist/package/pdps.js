"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axioms_1 = require("@zefiros/axioms");
const logger_1 = require("../common/logger");
const version_1 = require("../common/version");
const path_1 = require("../resolver/definition/path");
const internal_1 = require("./internal");
class PDPSPackageVersion extends internal_1.IPackageVersion {
    async getDefinition(parent) {
        logger_1.logger.logfile.info(`Trying to read '${this.package.info.options.rootDirectory}' from '${this.package.info.directories.definition}`);
        return path_1.getPathPackageDefinition(this.package, parent);
    }
    getCost() {
        return version_1.Version.versionInverse - version_1.Version.majorVersionCost;
    }
    getTargetPath() {
        return undefined;
    }
    getBuildPath() {
        return this.package.info.directories.source;
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
exports.PDPSPackageVersion = PDPSPackageVersion;
class PDPSPackage extends internal_1.IPackage {
    async getVersions() {
        return [new PDPSPackageVersion(this, this.id)];
    }
    get info() {
        return this.package.info;
    }
}
exports.PDPSPackage = PDPSPackage;
//# sourceMappingURL=pdps.js.map