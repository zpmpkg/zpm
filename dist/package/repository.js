"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const async_mutex_1 = require("async-mutex");
const spinner_1 = require("../cli/spinner");
const git_1 = require("../common/git");
class Repository {
    constructor(directory, url) {
        this.mutex = new async_mutex_1.Mutex();
        this.directory = directory;
        this.url = url;
        this.loaded = false;
    }
    async checkout(hash, spinner) {
        await this.mutex.runExclusive(async () => git_1.checkout(this.directory, hash, { spinner }));
    }
    async cloneOrPull(what) {
        await this.mutex.runExclusive(async () => {
            if (!this.loaded) {
                this.loaded = true;
                const spin = spinner_1.spinners.create({
                    text: `Pulling ${what}:`,
                });
                const result = await git_1.cloneOrPull(this.directory, this.url, {
                    stream: spin.stream,
                });
                spin.succeed(`Pulled ${what} ${this.getPullInfo(result)}`);
            }
        });
    }
    async cloneOrFetch(what) {
        await this.mutex.runExclusive(async () => {
            if (!this.loaded) {
                this.loaded = true;
                const spin = spinner_1.spinners.create({
                    text: `Pulling ${what}:`,
                });
                const result = await git_1.cloneOrFetch(this.directory, this.url, {
                    stream: spin.stream,
                });
                spin.succeed(`Fetched ${what} ${this.getFetchInfo(result)}`);
            }
        });
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
exports.Repository = Repository;
const _repositories = new Map();
function createRepository(directory, url) {
    if (!_repositories.has(directory)) {
        if (url) {
            _repositories.set(directory, new Repository(directory, url));
        }
        else {
            // @todo
        }
    }
    return _repositories.get(directory);
}
exports.createRepository = createRepository;
//# sourceMappingURL=repository.js.map