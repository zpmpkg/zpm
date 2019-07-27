"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axioms_1 = require("@zefiros/axioms");
const upath_1 = require("upath");
const async_1 = require("../common/async");
const environment_1 = require("../common/environment");
const logger_1 = require("../common/logger");
const util_1 = require("../common/util");
const git_1 = require("../resolver/definition/git");
const git_2 = require("../resolver/source/git");
const internal_1 = require("./internal");
const repository_1 = require("./repository");
class GDGSPackageVersion extends internal_1.IPackageVersion {
    constructor(pkg, id, gitVersion) {
        super(pkg, `${id}:${gitVersion.name}-${util_1.shorten(gitVersion.hash)}`);
        this.gitVersion = gitVersion;
    }
    async getDefinition(parent) {
        logger_1.logger.logfile.info(`Trying to read '${this.package.info.entry.repository}' definition`);
        return git_1.getGitPackageDefinition(this.package, this.gitVersion, parent);
    }
    getVersion() {
        return {
            name: this.gitVersion.name,
            hash: this.gitVersion.hash,
            version: this.gitVersion.version.toString(),
        };
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
    getCost() {
        return this.gitVersion.version.cost;
    }
    addUsage(usage) {
        const entry = usage.entry;
        if (entry.usage.version.satisfies(this.gitVersion.version)) {
            if (!axioms_1.isDefined(this.version.usedBy[usage.addedBy.id])) {
                this.version.usedBy[usage.addedBy.id] = {
                    settings: entry.usage.settings,
                    optional: axioms_1.isDefined(entry.usage.optional) ? entry.usage.optional : false,
                };
            }
            return true;
        }
        return false;
    }
}
exports.GDGSPackageVersion = GDGSPackageVersion;
class GDGSPackage extends internal_1.IPackage {
    async load() {
        const promises = [
            repository_1.createRepository(this.info.directories.source, this.info.entry.repository).cloneOrFetch(`repository '${this.info.name}'`),
        ];
        if (axioms_1.isDefined(this.info.entry.definition)) {
            promises.push(repository_1.createRepository(this.info.directories.definition, this.info.entry.definition).cloneOrFetch(`repository '${this.info.name}'`));
        }
        await async_1.settledPromiseAll(promises);
        return true;
    }
    async getVersions() {
        const fversions = await git_2.listGitVersions(this.info.directories.source);
        return fversions.map(v => new GDGSPackageVersion(this, this.id, v));
    }
    get info() {
        return this.package.info;
    }
}
exports.GDGSPackage = GDGSPackage;
//# sourceMappingURL=gdgs.js.map