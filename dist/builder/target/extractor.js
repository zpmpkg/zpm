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
const lock_1 = require("../lock");
const packageBuilder_1 = require("../packageBuilder");
class TargetExtractor extends packageBuilder_1.PackageBuilder {
    async run(target) {
        const hash = target.getHash();
        if (await this.needsExtraction(target)) {
            const spin = spinner_1.spinners.create({
                text: `Extracting '${target.package.fullName}@${hash}':`,
            });
            try {
                await fs.remove(target.getTargetPath());
                await fs.ensureDir(target.getTargetPath());
                if (await this.ensureSourceHash(target)) {
                    const extraction = {
                        pkg: {
                            settings: target.lock.settings,
                            description: target.lock.description,
                            usage: axioms_1.get(this.lock.usage, ['settings', target.lock.id]) || {},
                            globals: this.lock.description,
                            source: target.package.source.getRepositoryPath(),
                            target: target.getTargetPath(),
                        },
                        git: new git_1.GitApi(target.package.source.getRepositoryPath(), spin),
                        fs: new fs_1.FsApi(target.package.source.getRepositoryPath(), target.getTargetPath(), spin),
                        shell: new shell_1.ShellApi(target.package.source.getRepositoryPath(), target.getTargetPath(), spin),
                    };
                    if (lock_1.isNamedLock(target.lock)) {
                        extraction.pkg.hash = target.lock.hash;
                    }
                    const filepath = upath_1.join(io_1.transformPath(this.package.source.getDefinitionPath()), 'extract.ts');
                    const script = await sandbox_1.executeSandboxTypescript(filepath, extraction);
                    if (script) {
                        if (lock_1.isNamedLock(target.lock) &&
                            lodash_1.isFunction(script.checkout) &&
                            target.options.type === packageBuilder_1.PackageType.NAMED) {
                            await script.checkout();
                        }
                        if (lodash_1.isFunction(script.extract)) {
                            await script.extract();
                        }
                    }
                }
                else {
                    logger_1.logger.error(`Failed to find hash '${hash}' on package '${target.package.fullName}'`);
                }
                await this.writeExtractionHash(target);
            }
            catch (err) {
                logger_1.logger.error(err);
            }
            spin.succeed(`Extracted '${target.package.fullName}'`);
        }
        return true;
    }
    async needsExtraction(target) {
        const hash = target.getHash();
        const file = this.getExtractionHashPath(target);
        if (!program_1.force() && (await fs.pathExists(file)) && hash) {
            return (await fs.readFile(file)).toString() !== hash;
        }
        return true;
    }
    async writeExtractionHash(target) {
        const hash = target.getHash();
        if (hash) {
            await fs.writeFile(this.getExtractionHashPath(target), hash);
        }
    }
    getExtractionHashPath(target) {
        return upath_1.join(target.getTargetPath(), '.EXTRACTION_HASH');
    }
    async ensureSourceHash(target) {
        const hash = target.getHash();
        if (hash) {
            if (await git_2.hasHash(target.package.source.getRepositoryPath(), hash)) {
                return true;
            }
            else {
                throw new Error(`Repository '${target.package.fullName}' does not contain hash '${hash}'`);
            }
        }
        return true;
    }
}
exports.TargetExtractor = TargetExtractor;
//# sourceMappingURL=extractor.js.map