"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("util");
const logger_1 = require("../common/logger");
const version_1 = require("../common/version");
const path_1 = require("../resolver/definition/path");
const is_defined_1 = require("@zefiros/axioms/is-defined");
const git_1 = require("../common/git");
const lodash_1 = require("lodash");
const async_1 = require("../common/async");
const spinner_1 = require("../cli/spinner");
class IPackage {
    constructor(pkg) {
        this.package = pkg;
    }
    async load() {
        return true;
    }
    get entry() {
        return this.info.entry;
    }
    get id() {
        return this.info.id;
    }
    get type() {
        return this.info.type;
    }
    get info() {
        return this.package.info;
    }
}
exports.IPackage = IPackage;
class Package {
    constructor(manifest, info) {
        this.versions = undefined;
        this.loaded = false;
        this.manifest = manifest;
        this.info = info;
        this.impl = this.createPackageType();
    }
    createPackageType() {
        switch (this.info.type) {
            case "PDPS" /* PDPS */:
                return new PDPSPackage(this);
            case "PSSub" /* PSSub */:
                return new PSSubPackage(this);
            case "GDGS" /* GDGS */:
                return new GDGSPackage(this);
            default:
                throw new Error(`${this.info.type} not implemented`);
        }
    }
    async load() {
        if (!this.loaded) {
            this.loaded = await this.impl.load();
        }
        return this.loaded;
    }
    async getVersions() {
        if (util_1.isUndefined(this.versions)) {
            await this.impl.load();
            this.versions = (await this.impl.getVersions()).map(v => {
                const version = new PackageVersion(v);
                v.version = version;
                return version;
            });
        }
        return this.versions;
    }
    get id() {
        return this.info.id;
    }
}
exports.Package = Package;
class IPackageVersion {
    constructor(pkg, id) {
        this._package = pkg;
        this.id = id;
    }
    get package() {
        return this._package;
    }
}
exports.IPackageVersion = IPackageVersion;
class PackageVersion {
    constructor(impl) {
        this.definition = undefined;
        this.impl = impl;
        this.usageBy = {};
        this.expanded = false;
    }
    get id() {
        return this.impl.id;
    }
    get package() {
        return this.impl.package;
    }
    get cost() {
        return this.impl.getCost();
    }
    async getDefinition() {
        if (util_1.isUndefined(this.definition)) {
            this.definition = await this.impl.getDefinition();
        }
        return this.definition;
    }
    addUsage(usage) {
        return this.impl.addUsage(usage);
    }
}
exports.PackageVersion = PackageVersion;
class PathPackage extends IPackage {
    addUsage(usage) {
        throw new Error('Method not implemented.');
    }
}
exports.PathPackage = PathPackage;
class PDPSPackageVersion extends IPackageVersion {
    async getDefinition() {
        logger_1.logger.logfile.info(`Trying to read '${this.package.info.entry.path}' from '${this.package.info.directories.definition}`);
        return path_1.getPathPackageDefinition(this.package);
    }
    getCost() {
        return version_1.Version.versionInverse - version_1.Version.majorVersionCost;
    }
    get package() {
        return this._package;
    }
    addUsage(usage) {
        const entry = usage.entry;
        if (!is_defined_1.isDefined(this.version.usageBy[usage.addedBy.id])) {
            this.version.usageBy[usage.addedBy.id] = {
                settings: entry.usage.settings,
                optional: is_defined_1.isDefined(entry.usage.optional) ? entry.usage.optional : false,
            };
        }
        return true;
    }
}
exports.PDPSPackageVersion = PDPSPackageVersion;
class PDPSPackage extends PathPackage {
    async getVersions() {
        return [new PDPSPackageVersion(this, this.id)];
    }
    get info() {
        return this.package.info;
    }
}
exports.PDPSPackage = PDPSPackage;
class PSSubPackageVersion extends IPackageVersion {
    async getDefinition() {
        logger_1.logger.logfile.info(`Trying to read '${this.package.info.entry.path}' from '${this.package.info.directories.definition}`);
        return path_1.getPathPackageDefinition(this.package);
    }
    getCost() {
        return version_1.Version.versionInverse - version_1.Version.majorVersionCost;
    }
    get package() {
        return this._package;
    }
    addUsage(usage) {
        const entry = usage.entry;
        if (!is_defined_1.isDefined(this.version.usageBy[usage.addedBy.id])) {
            this.version.usageBy[usage.addedBy.id] = {
                settings: entry.usage.settings,
                optional: is_defined_1.isDefined(entry.usage.optional) ? entry.usage.optional : false,
            };
        }
        return true;
    }
}
exports.PSSubPackageVersion = PSSubPackageVersion;
class PSSubPackage extends PathPackage {
    async getVersions() {
        return [new PSSubPackageVersion(this, this.id)];
    }
    get info() {
        return this.package.info;
    }
}
exports.PSSubPackage = PSSubPackage;
class GDGSPackageVersion extends IPackageVersion {
    constructor(pkg, id) {
        super(pkg, id);
    }
    async getDefinition() {
        throw new Error('not implemented');
    }
    get package() {
        return this._package;
    }
    getCost() {
        return version_1.Version.versionInverse - version_1.Version.majorVersionCost;
    }
    addUsage(usage) {
        const entry = usage.entry;
        if (!is_defined_1.isDefined(this.version.usageBy[usage.addedBy.id])) {
            this.version.usageBy[usage.addedBy.id] = {
                settings: entry.usage.settings,
                optional: is_defined_1.isDefined(entry.usage.optional) ? entry.usage.optional : false,
            };
        }
        return true;
    }
}
exports.GDGSPackageVersion = GDGSPackageVersion;
class GDGSPackage extends IPackage {
    async load() {
        await async_1.settledPromiseAll([
            (async () => {
                const spin = spinner_1.spinners.create({
                    text: `Pulling repository '${this.info.name}':`,
                });
                const result = await git_1.cloneOrFetch(this.info.directories.source, this.info.entry.repository, {
                    stream: spin.stream,
                });
                // spin.succeed(`Pulled repository '${this.info.name}' ${this.getFetchInfo(result)}`)
            })(),
            (async () => {
                if (is_defined_1.isDefined(this.info.entry.definition)) {
                    const spin = spinner_1.spinners.create({
                        text: `Pulling definition '${this.info.name}'`,
                    });
                    const result = await git_1.cloneOrPull(this.info.directories.definition, this.info.entry.definition, {
                        stream: spin.stream,
                    });
                    // spin.succeed(`Pulled definition '${this.info.name}' ${this.getPullInfo(result)}`)
                }
            })(),
        ]);
        return true;
    }
    async getVersions() {
        const output = await git_1.showRef(this.info.directories.definition);
        const versions = output
            .split('\n')
            .map(s => s.split(' '))
            .filter(s => s.length === 2)
            .map(s => {
            let result;
            try {
                if (s[1].includes('/tags/')) {
                    result = {
                        version: new version_1.Version(s[1].replace('refs/tags/', '')),
                        hash: s[0],
                        name: s[1].replace('refs/tags/', ''),
                    };
                }
                else if (s[1].includes('/remotes/')) {
                    result = {
                        version: new version_1.Version(s[1].replace('refs/remotes/origin/', '')),
                        hash: s[0],
                        name: s[1].replace('refs/remotes/origin/', ''),
                    };
                }
            }
            catch (error) {
                result = undefined;
            }
            return result;
        })
            .filter(is_defined_1.isDefined)
            .sort((a, b) => b.version.cost - a.version.cost)
            .reverse();
        const fversions = lodash_1.reject(versions, (object, i) => {
            return i > 0 && versions[i - 1].version.toString() === object.version.toString();
        });
        return [];
    }
    get info() {
        return this.package.info;
    }
    addUsage(usage) {
        throw new Error('Method not implemented.');
    }
}
exports.GDGSPackage = GDGSPackage;
//# sourceMappingURL=package.js.map