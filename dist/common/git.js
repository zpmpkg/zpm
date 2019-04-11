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
const lodash_1 = require("lodash");
const promise_1 = __importDefault(require("simple-git/promise"));
const storage_1 = require("./storage");
const util_1 = require("./util");
exports.git = (cwd) => promise_1.default(cwd);
async function _showRef(destination, options) {
    const extras = options || [];
    return exports.git(destination).raw(['show-ref', ...extras]);
}
exports._showRef = _showRef;
async function _pull(destination, remote, branch, options) {
    return exports.git(destination).pull(remote, branch, options);
}
exports._pull = _pull;
async function _fetch(destination, options = {}) {
    return exports.git(destination)
        .outputHandler((command, stdout, stderr) => {
        if (options.stream) {
            stdout.pipe(options.stream);
            stderr.pipe(options.stream);
        }
    })
        .fetch(options.remote, options.branch, options.options);
}
exports._fetch = _fetch;
async function _tags(destination, options) {
    return exports.git(destination).tags(options);
}
exports._tags = _tags;
async function _clone(destination, remote, options = {}) {
    return exports.git()
        .outputHandler((command, stdout, stderr) => {
        if (options.stream) {
            stdout.pipe(options.stream);
            stderr.pipe(options.stream);
        }
    })
        .clone(remote.toString(), destination, options.options);
}
exports._clone = _clone;
async function _cloneOrPull(destination, url, options = {}) {
    const returnValue = {
        cloned: !(await fs.pathExists(destination)),
        latest: '',
    };
    const key = `git.head.${destination}`;
    const hash = await storage_1.storage.getItem(key);
    if (await fs.pathExists(destination)) {
        await _fetch(destination, {
            remote: 'origin',
            branch: options.branch,
            options: { '--prune': null, '--progress': null },
        });
        const sha = await exports.getBranchSHA1(destination, getBranch(options.branch));
        await checkout(destination, sha);
        returnValue.latest = sha;
        if (hash) {
            returnValue.newCommits = lodash_1.toSafeInteger((await exports.git(destination).raw([
                'rev-list',
                '--count',
                `${hash}...origin/${options.branch || 'master'}`,
            ])).trim());
        }
    }
    else {
        returnValue.latest = await exports.clone(destination, url, {
            options: ['--progress'],
            stream: options.stream,
        });
    }
    return returnValue;
}
exports._cloneOrPull = _cloneOrPull;
async function _cloneOrFetch(destination, url, options = {}) {
    const returnValue = { cloned: !(await fs.pathExists(destination)) };
    const key = `git.head.${destination}`;
    const hash = await storage_1.storage.getItem(key);
    if (!returnValue.cloned) {
        await _fetch(destination, {
            remote: 'origin',
            branch: options.branch,
            options: { '--prune': null, '--all': null, '--progress': null },
            stream: options.stream,
        });
        if (hash) {
            returnValue.newCommits = lodash_1.toSafeInteger((await exports.git(destination).raw([
                'rev-list',
                '--count',
                `${hash}...origin/${options.branch || 'master'}`,
            ])).trim());
        }
    }
    else {
        await _clone(destination, url, {
            options: [
                '--quiet',
                '--recurse',
                '-v',
                '-j8',
                '-c',
                'core.longpaths=true',
                '-c',
                'core.fscache=true',
                '--progress',
                ...(options.branch ? ['-b', options.branch] : []),
            ],
            stream: options.stream,
        });
    }
    const newHash = await getHash(destination, options.branch);
    if (newHash !== hash) {
        await storage_1.storage.setItem(key, newHash);
    }
    return returnValue;
}
exports._cloneOrFetch = _cloneOrFetch;
async function getHash(destination, branch) {
    return (await exports.git(destination).revparse([`origin/${branch || 'master'}`])).trim();
}
async function _getBranchSHA1(destination, branch) {
    return util_1.shorten(await exports.git(destination).revparse(branch ? [branch] : undefined));
}
exports._getBranchSHA1 = _getBranchSHA1;
async function _hasSubmodules(destination) {
    const output = await exports.git(destination).raw([
        'config',
        '--file',
        '.gitmodules',
        '--name-only',
        '--get-regexp',
        'path',
    ]);
    return util_1.isDefined(output) && output.length > 0;
}
exports._hasSubmodules = _hasSubmodules;
async function hasHash(destination, hash) {
    try {
        await exports.git(destination)
            .silent(true)
            .raw(['reflog', 'show', hash]);
        return true;
    }
    catch (error) {
        return false;
    }
}
exports.hasHash = hasHash;
async function catFile(destination, options = []) {
    try {
        const result = await exports.git(destination)
            .silent(true)
            .catFile(options);
        return result;
    }
    catch (error) {
        return undefined;
    }
}
exports.catFile = catFile;
async function checkout(destination, hash, options = {}) {
    const current = await exports.git(destination).revparse(['HEAD']);
    if (!current.includes(hash)) {
        const checkoutSpin = options.spinner
            ? options.spinner.addChild('Checking out hash')
            : undefined;
        await exports.git(destination)
            .outputHandler((command, stdout, stderr) => {
            if (checkoutSpin) {
                stdout.pipe(checkoutSpin.stream);
                stderr.pipe(checkoutSpin.stream);
            }
        })
            .checkout([hash, '--force']);
        if (checkoutSpin) {
            checkoutSpin.succeed('Checked out repository');
        }
        if (await _hasSubmodules(destination)) {
            const spin = options.spinner
                ? options.spinner.addChild('Checking out submodules')
                : undefined;
            await exports.git(destination)
                .outputHandler((command, stdout, stderr) => {
                if (spin) {
                    stdout.pipe(spin.stream);
                    stderr.pipe(spin.stream);
                }
            })
                .raw([
                '-c',
                'core.longpaths=true',
                'submodule',
                'update',
                '--checkout',
                '-j',
                '16',
                '--force',
                '--progress',
            ]);
            if (spin) {
                spin.succeed(`Extracted submodules`);
            }
        }
    }
}
exports.checkout = checkout;
function getBranch(name) {
    if (util_1.isDefined(name)) {
        return `origin/${name || 'master'}`;
    }
    return undefined;
}
exports.getBranch = getBranch;
exports.pull = _pull; // currently disabled: memoize(_pull)
exports.clone = _clone; // currently disabled: memoize(_clone)
exports.cloneOrPull = _cloneOrPull; // currently disabled: memoize(_cloneOrPull)
exports.cloneOrFetch = _cloneOrFetch; // currently disabled: memoize(_cloneOrFetch)
exports.tags = _tags; // currently disabled: memoize(_tags)
exports.showRef = _showRef; // currently disabled: memoize(_showRef)
exports.getBranchSHA1 = _getBranchSHA1; // currently disabled: memoize(_getBranchSHA1)
//# sourceMappingURL=git.js.map