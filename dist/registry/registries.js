"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const async_mutex_1 = require("async-mutex");
const lodash_1 = require("lodash");
const async_1 = require("../common/async");
const environment_1 = require("../common/environment");
const io_1 = require("../common/io");
const util_1 = require("../common/util");
const package_1 = require("./package");
const registry_1 = require("./registry");
function isPathRegistry(entry) {
    return lodash_1.has(entry, 'path');
}
exports.isPathRegistry = isPathRegistry;
function isNamedRegistry(entry) {
    return lodash_1.has(entry, 'url');
}
exports.isNamedRegistry = isNamedRegistry;
class Registries {
    constructor(zpm) {
        this.manifests = {};
        this.addMutex = new async_mutex_1.Mutex();
        this.zpm = zpm;
    }
    async load() {
        await this.findRegistries();
        await this.loadManifests();
    }
    getTypes() {
        return this.zpm.config.values.registry.map(r => r.name);
    }
    getRegistries() {
        return this.zpm.config.values.registry;
    }
    getManifest(type) {
        return this.manifests[type];
    }
    search(entry) {
        return this.manifests[entry.type].search(entry);
    }
    addPackage(type, entry, options) {
        return this.manifests[type].add(entry, options);
    }
    async loadManifests() {
        await async_1.settledPromiseAll(this.zpm.config.values.registry.map(async (r) => {
            this.manifests[r.name] = new package_1.Manifest(this, r.name, r.options);
            await this.manifests[r.name].load();
        }));
    }
    async findRegistries() {
        const registries = [
            ...this.zpm.config.values.registries
                .filter(isNamedRegistry)
                .map(registry => new registry_1.Registry(registry.url, { branch: registry.branch })),
            ...this.zpm.config.values.registries.filter(isPathRegistry).map(registry => new registry_1.Registry(io_1.transformPath(registry.path), {
                name: registry.name,
                workingDirectory: registry.workingDirectory,
            })),
            new registry_1.Registry(environment_1.environment.directory.zpm, {
                workingDirectory: environment_1.environment.directory.zpm,
                name: 'ZPM',
            }),
            new registry_1.Registry(environment_1.environment.directory.workingdir, { name: 'ROOT' }),
        ];
        const newRegistries = lodash_1.flatten(lodash_1.filter(await async_1.settledPromiseAll(registries.map(async (registry) => registry.update())), util_1.isDefined));
        // go one deeper in the registry chain (each registry may also host a registry list)
        newRegistries.filter(isNamedRegistry).forEach(r => {
            registries.push(new registry_1.Registry(r.url, { branch: r.branch }));
        });
        await async_1.settledPromiseAll(registries.map(async (registry) => {
            await registry.update();
        }));
        this.registries = registries.filter(x => x.valid);
    }
}
exports.Registries = Registries;
//# sourceMappingURL=registries.js.map