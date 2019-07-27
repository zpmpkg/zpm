"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const axioms_1 = require("@zefiros/axioms");
const fs = __importStar(require("fs-extra"));
const lodash_1 = require("lodash");
const upath_1 = require("upath");
const fs_1 = require("../api/fs");
const git_1 = require("../api/git");
const shell_1 = require("../api/shell");
const git_2 = require("../common/git");
const logger_1 = require("../common/logger");
const sandbox_1 = require("../sandbox/sandbox");
const packageBuilder_1 = require("./packageBuilder");
class TargetExtractor extends packageBuilder_1.TargetBuilder {
    async prepare(target) {
        if (target.needsExtraction && target.targetPath) {
            // logger.debug(`Preparing ${this.version.id} on ${target.version.id}`)
            try {
                target.spin.update(`Cleaning '${target.version.id}':`);
                await fs.remove(target.targetPath);
                await fs.ensureDir(target.targetPath);
                const extraction = await this.buildExtraction(target);
                if (extraction.script) {
                    if (target.hash && lodash_1.isFunction(extraction.script.checkout)) {
                        target.spin.update(`Checking out '${target.version.id}':`);
                        await this.ensureSourceHash(target);
                        await extraction.script.checkout();
                    }
                }
            }
            catch (err) {
                logger_1.logger.error(err);
                target.spin.fail(err);
            }
        }
        return true;
    }
    async run(target) {
        if (target.needsExtraction && target.targetPath) {
            const extraction = this.get(target);
            try {
                if (extraction && extraction.script) {
                    if (lodash_1.isFunction(extraction.script.extract)) {
                        target.spin.update(`Extracting '${target.version.id}':`);
                        await extraction.script.extract();
                    }
                }
            }
            catch (err) {
                logger_1.logger.error(err);
                target.spin.fail(err);
            }
        }
        return true;
    }
    async ensureSourceHash(target) {
        if (target.hash) {
            if (await git_2.hasHash(target.version.package.info.directories.source, target.hash)) {
                return true;
            }
            else {
                throw new Error(`Package '${target.version.id}' does not contain hash '${target.hash}'`);
            }
        }
        return true;
    }
    async buildExtraction(target) {
        if (!axioms_1.isDefined(target.targetPath)) {
            throw new Error();
            // @todo
        }
        const extraction = {
            version: {
                settings: target.versionLock.settings,
                definition: target.versionLock.definition,
                usage: axioms_1.get(this.versionLock.usedBy.find(u => u.versionId === target.version.id), ['settings'], {}),
                global: this.versionLock.definition,
                source: target.sourcePath,
                target: target.targetPath,
                hash: target.hash,
            },
            git: new git_1.GitApi(target.sourcePath, target.spin),
            fs: new fs_1.FsApi(target.sourcePath, target.targetPath, target.spin),
            shell: new shell_1.ShellApi(target.sourcePath, target.targetPath, target.spin),
        };
        const filepath = upath_1.join(this.version.package.info.directories.definition, 'extract.ts');
        const store = {
            api: extraction,
            script: await sandbox_1.executeSandboxTypescript(filepath, extraction),
        };
        this.store(target, store);
        return store;
    }
}
exports.TargetExtractor = TargetExtractor;
//# sourceMappingURL=extractor.js.map