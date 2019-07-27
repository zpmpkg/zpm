"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axioms_1 = require("@zefiros/axioms");
const spinner_1 = require("../cli/spinner");
class IBuilder {
    constructor(builder, version, versionLock) {
        this.builder = builder;
        this.version = version;
        this.versionLock = versionLock;
    }
    async initialize() {
        return true;
    }
    async build() {
        return true;
    }
}
exports.IBuilder = IBuilder;
class PackageBuilder extends IBuilder {
    constructor(builder, version, versionLock) {
        super(builder, version, versionLock);
        this.spin = spinner_1.spinners.create({
            text: `Building '${this.version.id}':`,
        });
    }
    finish() {
        this.spin.succeed(`Built '${this.version.id}'`);
    }
    get targetPath() {
        return this.version.targetPath;
    }
    get buildPath() {
        return this.version.buildPath;
    }
    get sourcePath() {
        return this.version.package.info.directories.source;
    }
    get hash() {
        return axioms_1.get(this.version, ['version', 'hash']);
    }
    get needsExtraction() {
        return axioms_1.isDefined(this.targetPath);
    }
}
exports.PackageBuilder = PackageBuilder;
class TargetBuilder extends IBuilder {
    constructor() {
        super(...arguments);
        this.used = false;
        this.blackboard = new Map();
    }
    getTargets() {
        return this.versionLock.usedBy
            .map(v => this.builder.versions.get(v.versionId))
            .filter(axioms_1.isDefined);
    }
    async initialize() {
        const targets = this.getTargets();
        for (const target of targets) {
            await this.prepare(target);
        }
        return false;
    }
    async build() {
        const targets = this.getTargets();
        for (const target of targets) {
            const succeeded = await this.run(target);
            this.used = this.used || succeeded;
        }
        return false;
    }
    store(target, obj) {
        this.blackboard.set(target.version.id, obj);
    }
    get(target) {
        return this.blackboard.get(target.version.id);
    }
    async run(target) {
        return false;
    }
    async prepare(target) {
        return true;
    }
    async finish() {
        return true;
    }
}
exports.TargetBuilder = TargetBuilder;
//# sourceMappingURL=packageBuilder.js.map