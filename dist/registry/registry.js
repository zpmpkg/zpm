"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs-extra"));
const git_url_parse_1 = __importDefault(require("git-url-parse"));
const upath_1 = require("upath");
const inquiries_1 = require("../cli/inquiries");
const program_1 = require("../cli/program");
const spinner_1 = require("../cli/spinner");
const environment_1 = require("../common/environment");
const git_1 = require("../common/git");
const logger_1 = require("../common/logger");
const util_1 = require("../common/util");
class Registry {
    constructor(urlOrPath, options) {
        this.valid = true;
        this.isLocal = false;
        this.isUpdated = false;
        const { branch, name } = options || { branch: undefined, name: undefined };
        this.urlOrPath = urlOrPath;
        this.branch = branch;
        this.name = name;
    }
    async update() {
        if (this.isUpdated) {
            return undefined;
        }
        if (git_url_parse_1.default(this.urlOrPath).protocol === 'file') {
            if (await fs.pathExists(this.urlOrPath)) {
                this.directory = this.urlOrPath;
            }
            else {
                logger_1.logger.error(`We do not support file protocol for registry: ${this.urlOrPath}`);
                this.valid = false;
            }
        }
        else {
            this.directory = upath_1.join(environment_1.environment.directory.registries, util_1.shortHash(this.urlOrPath));
            if (await this.mayPull()) {
                const spin = spinner_1.spinners.create(`Pulling registry ${this.urlOrPath}`);
                const fetched = await git_1.cloneOrPull(this.directory, this.urlOrPath, {
                    branch: this.branch,
                    stream: spin.stream,
                });
                spin.succeed(`Pulled registry '${this.urlOrPath}' ${this.getHitInfo(fetched)}`);
            }
        }
        this.isUpdated = true;
        return [];
    }
    async mayPull() {
        return (program_1.update() ||
            (!(await fs.pathExists(this.directory)) && (program_1.headless() || inquiries_1.askRegistry(this.urlOrPath))));
    }
    getHitInfo(fetched) {
        if (!fetched.cloned) {
            if (fetched.newCommits) {
                return `(${fetched.newCommits})`;
            }
            return '(no changes)';
        }
        return '(cloned)';
    }
}
exports.Registry = Registry;
//# sourceMappingURL=registry.js.map