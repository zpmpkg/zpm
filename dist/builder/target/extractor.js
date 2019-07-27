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
const fs_1 = require("../../api/fs");
const git_1 = require("../../api/git");
const shell_1 = require("../../api/shell");
const program_1 = require("../../cli/program");
const spinner_1 = require("../../cli/spinner");
const git_2 = require("../../common/git");
const io_1 = require("../../common/io");
const logger_1 = require("../../common/logger");
const sandbox_1 = require("../../sandbox/sandbox");
const packageBuilder_1 = require("../packageBuilder");
class TargetExtractor extends packageBuilder_1.TargetBuilder {
    async run(target) {
        if (this.needsExtraction(target) && target.targetPath) {
            const hash = target.hash;
            const spin = spinner_1.spinners.create({
                text: `Extracting '${target.version.id}@${hash}':`,
            });
            try {
                await fs.remove(target.targetPath);
                await fs.ensureDir(target.targetPath);
                if (await this.ensureSourceHash(target)) {
                    const extraction = {
                        pkg: {
                            settings: target.versionLock.settings,
                            definition: target.versionLock.definition,
                            // usage:
                            //     get(this.versionLock.usage, ['settings', target.versionLock.id]) ||
                            //     {},
                            globals: this.versionLock.definition,
                            source: target.sourcePath,
                            target: target.targetPath,
                            hash: target.hash,
                        },
                        git: new git_1.GitApi(target.sourcePath, spin),
                        fs: new fs_1.FsApi(target.sourcePath, target.targetPath, spin),
                        shell: new shell_1.ShellApi(target.sourcePath, target.targetPath, spin),
                    };
                    const filepath = upath_1.join(io_1.transformPath(this.version.package.info.directories.definition), 'extract.ts');
                    const script = await sandbox_1.executeSandboxTypescript(filepath, extraction);
                    if (script) {
                        if (axioms_1.isDefined(target.hash) && lodash_1.isFunction(script.checkout)) {
                            logger_1.logger.debug(`Checkout package ${target.version.id}`);
                            await script.checkout();
                        }
                        if (lodash_1.isFunction(script.extract)) {
                            // await script.extract()
                        }
                    }
                }
                else {
                    logger_1.logger.error(`Failed to find hash '${hash}' on package '${target.version.id}'`);
                }
                this.writeExtractionHash(target);
            }
            catch (err) {
                logger_1.logger.error(err);
            }
            spin.succeed(`Extracted '${target.version.id}'`);
        }
        return true;
    }
    needsExtraction(target) {
        if (!axioms_1.isDefined(target.hash)) {
            return false;
        }
        const file = this.getExtractionHashPath(target);
        if (!program_1.force() && fs.pathExistsSync(file) && target.hash) {
            return fs.readFileSync(file).toString() !== target.hash;
        }
        return true;
    }
    writeExtractionHash(target) {
        if (target.hash) {
            fs.writeFileSync(this.getExtractionHashPath(target), target.hash);
        }
    }
    getExtractionHashPath(target) {
        return upath_1.join(target.targetPath, '.EXTRACTION_HASH');
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
}
exports.TargetExtractor = TargetExtractor;
//# sourceMappingURL=extractor.js.map