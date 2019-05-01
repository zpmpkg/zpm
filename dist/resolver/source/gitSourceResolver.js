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
const is_git_url_1 = __importDefault(require("is-git-url"));
const upath_1 = require("upath");
const program_1 = require("../../cli/program");
const spinner_1 = require("../../cli/spinner");
const async_1 = require("../../common/async");
const environment_1 = require("../../common/environment");
const git_1 = require("../../common/git");
// import { copy } from '~/common/io'
const util_1 = require("../../common/util");
const version_1 = require("../../common/version");
const sourceResolver_1 = require("./sourceResolver");
const gitDefinitionResolver_1 = require("../definition/gitDefinitionResolver");
const pathDefinitionResolver_1 = require("../definition/pathDefinitionResolver");
const factory_1 = require("./factory");
const lodash_1 = require("lodash");
class GitSourceResolver extends sourceResolver_1.SourceResolver {
    constructor() {
        super(...arguments);
        this.loaded = false;
        this.gitDefinition = true;
    }
    async load() {
        if (this.loaded) {
            return true;
        }
        this.loaded = true;
        if (this.isDefinitionSeparate()) {
            this.definitionResolver = new pathDefinitionResolver_1.PathDefinitionResolver(this);
            this.gitDefinition = is_git_url_1.default(this.definition);
        }
        else {
            this.definitionResolver = new gitDefinitionResolver_1.GitDefinitionResolver(this);
        }
        if (await this.mayPull()) {
            await async_1.settledPromiseAll([
                (async () => {
                    const spin = spinner_1.spinners.create({
                        text: `Pulling repository '${this.package.fullName}':`,
                    });
                    const result = await git_1.cloneOrFetch(this.getRepositoryPath(), this.repository, {
                        stream: spin.stream,
                    });
                    spin.succeed(`Pulled repository '${this.package.fullName}' ${this.getFetchInfo(result)}`);
                })(),
                (async () => {
                    if (this.gitDefinition) {
                        const spin = spinner_1.spinners.create({
                            text: `Pulling definition '${this.package.fullName}'`,
                        });
                        const result = await git_1.cloneOrPull(this.getDefinitionPath(), this.definition, {
                            stream: spin.stream,
                        });
                        spin.succeed(`Pulled definition '${this.package.fullName}' ${this.getPullInfo(result)}`);
                    }
                })(),
            ]);
        }
        return this.loaded;
    }
    getName() {
        return 'GIT';
    }
    getDefinitionPath() {
        if (this.gitDefinition) {
            return upath_1.join(this.getCachePath(), 'definition');
        }
        let path = this.definition;
        if (util_1.isDefined(this.package.options.absolutePath)) {
            path = upath_1.join(this.package.options.absolutePath, path);
        }
        if (this.package.options.root) {
            return upath_1.normalizeSafe(upath_1.join(this.package.options.root.source.getDefinitionPath(), path));
        }
        return path;
    }
    getRepositoryPath() {
        return upath_1.join(this.getCachePath(), 'repository');
    }
    isDefinitionSeparate() {
        return this.definition !== this.repository && this.definition !== undefined;
    }
    async getVersions() {
        // we need to be certain we have the repository
        if (!(await this.load())) {
            return [];
        }
        const output = await git_1.showRef(this.getRepositoryPath());
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
            .filter(util_1.isDefined)
            .sort((a, b) => b.version.cost - a.version.cost)
            .reverse();
        const fversions = lodash_1.reject(versions, (object, i) => {
            return i > 0 && versions[i - 1].version.toString() === object.version.toString();
        });
        return fversions;
    }
    getPath() {
        if (factory_1.isNamedEntry(this.package.entry)) {
            return this.package.entry.name;
        }
        else {
            throw new Error('not implemented');
        }
    }
    getCachePath() {
        return upath_1.join(environment_1.environment.directory.packages, this.package.manifest.type, this.package.vendor, this.package.name);
    }
    async mayPull() {
        return program_1.update() || program_1.headless() || !(await fs.pathExists(this.getCachePath()));
    }
    getPullInfo(fetched) {
        if (!fetched.cloned) {
            if (fetched.newCommits) {
                return `(${fetched.newCommits} new commits)`;
            }
            return '(no changes)';
        }
        return '(cloned)';
    }
    getFetchInfo(fetched) {
        if (!fetched.cloned) {
            if (fetched.newCommits) {
                return `(${fetched.newCommits} new commits)`;
            }
            return '(no changes)';
        }
        return '(cloned)';
    }
}
exports.GitSourceResolver = GitSourceResolver;
//# sourceMappingURL=gitSourceResolver.js.map