"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const async_mutex_1 = require("async-mutex");
const js_sha256_1 = require("js-sha256");
const json_stable_stringify_1 = __importDefault(require("json-stable-stringify"));
const path_1 = __importDefault(require("path"));
const upath_1 = require("upath");
const factory_1 = require("../resolver/source/factory");
class Package {
    constructor(manifest, entry, options) {
        this.loaded = false;
        this.mutex = new async_mutex_1.Mutex();
        this.manifest = manifest;
        this.source = factory_1.createSourceResolver(entry, this);
        this.entry = entry;
        this.options = Object.assign({ type: 1 /* Named */, isRoot: false }, options);
        if (factory_1.isNamedEntry(entry)) {
            this.fullName = entry.name;
            const split = entry.name.split('/');
            this.name = split[1];
            this.vendor = split[0];
        }
        else if (factory_1.isPathEntry(entry)) {
            this.fullName = this.getFullName();
            this.name = entry.name || path_1.default.basename(entry.path);
            this.vendor = 'Local';
        }
    }
    async overrideEntry(entry) {
        if (this.calculateEntryHash()) {
            await this.mutex.runExclusive(async () => {
                this.entry = entry;
                this.source = factory_1.createSourceResolver(entry, this);
                await this.source.load();
            });
        }
    }
    getHash() {
        //return `${this.manifest.type}:${this.source.getName()}:${this.fullName}`
        return `${this.manifest.type}:${this.fullName}`;
    }
    async load() {
        if (!this.loaded) {
            this.loaded = await this.source.load();
        }
        return this.loaded;
    }
    getFullName() {
        if (this.options.isRoot) {
            return '$ROOT';
        }
        else if (this.options.rootHash) {
            return `${this.getRootName()}:${upath_1.normalize(this.source.getPath())}`;
        }
        return this.source.getPath();
    }
    getRootName() {
        if (this.options.isRoot) {
            return '$ROOT';
        }
        else if (this.options.root) {
            return this.options.root.options.isRoot ? '$ROOT' : this.options.rootHash;
        }
        else {
            throw new Error('This should not be called');
        }
    }
    calculateEntryHash() {
        const oldValue = this.loadedEntryHash;
        this.loadedEntryHash = js_sha256_1.sha256(json_stable_stringify_1.default(this.entry));
        return oldValue !== this.loadedEntryHash;
    }
}
exports.Package = Package;
//# sourceMappingURL=package.js.map