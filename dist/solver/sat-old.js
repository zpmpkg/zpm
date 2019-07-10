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
const fs_extra_1 = require("fs-extra");
const lodash_1 = require("lodash");
const Logic = __importStar(require("logic-solver"));
const upath_1 = require("upath");
const program_1 = require("../cli/program");
const async_1 = require("../common/async");
const environment_1 = require("../common/environment");
const io_1 = require("../common/io");
const logger_1 = require("../common/logger");
const range_1 = require("../common/range");
const util_1 = require("../common/util");
const validation_1 = require("../common/validation");
const package_1 = require("../registry/package");
const schemas_1 = require("../schemas/schemas");
const package_2 = require("./package");
class SATSolver {
    constructor(registries) {
        this.solver = new Logic.Solver();
        this.loadedCache = {};
        this.versions = {};
        this.termMap = {
            named: {},
            path: {},
        };
        this.weights = { terms: [], weights: [] };
        this.minimize = true;
        this.lockValidator = validation_1.buildSchema(schemas_1.lockFileV1);
        this.registries = registries;
    }
    async load() {
        this.lockContent = await this.getLockFile();
        if (util_1.isDefined(this.lockContent)) {
            // const types: string[] = this.registries.getTypes()
            // this.assumptions = []
            // for (const type of types) {
            //     for await (const pkg of get(this.lockContent.named, [type], [])) {
            //         const found = await this.registries.searchPackage(type, { name: pkg.name })
            //         if (isDefined(found)) {
            //             this.assumptions!.push(
            //                 this.toTerm(found.getHash(), new Version(pkg.version))
            //             )
            //         } else {
            //             // @todo
            //         }
            //     }
            // }
        }
        return true;
    }
    async save() {
        if (util_1.isDefined(this.lockContent)) {
            await io_1.writeJson(this.getLockFilePath(), this.lockContent);
        }
    }
    async rollback() {
        //
    }
    async addPackage(pkg, extra = {}) {
        const hash = pkg.getId();
        const versions = await pkg.source.getVersions();
        if (await this.tryInsertPackage(hash)) {
            if (versions.length > 0) {
                await this.addPackageVersions(hash, versions, pkg);
            }
            else {
                const definition = await pkg.source.definitionResolver.getPackageDefinition();
                let hasLock = false;
                if (!lodash_1.has(this.termMap.path, [hash, 'package'])) {
                    this.termMap.path[hash] = {
                        package: pkg,
                        description: definition.description,
                        usage: {
                            required: {},
                            optional: {},
                        },
                        settings: {},
                        ...extra,
                    };
                    hasLock = true;
                }
                const usage = await this.addDefinition(hash, definition, { package: pkg, hash });
                if (hasLock) {
                    this.termMap.path[hash].usage = usage;
                }
                // console.log(hash, '@')
                this.solver.require(Logic.exactlyOne(hash));
            }
            // await this.addDefinition(hash, pkg.resolver.definitionResolver.getPackageDefinition())
            this.unlockPackage(hash);
        }
        return versions;
    }
    async addDefinition(hash, definition, parent) {
        const usage = { required: {}, optional: {} };
        await async_1.settledPromiseAll([
            ...lodash_1.flatten(lodash_1.toPairs(definition.packages.named).map(p => p[1]
                .filter(x => package_2.isGitPackageEntry(x))
                .map((e) => ({
                description: e,
                definitionPath: definition.definitionPath,
                type: p[0],
                optional: e.optional === true,
            })))).map(async (pkg) => {
                const found = await this.addNamedEntry(pkg, hash, parent);
                const key = pkg.optional ? 'optional' : 'required';
                if (!util_1.isDefined(usage[key][pkg.type])) {
                    usage[key][pkg.type] = [];
                }
                usage[key][pkg.type].push(found.terms);
            }),
            ...lodash_1.flatten(lodash_1.toPairs(definition.packages.path).map(p => p[1]
                .filter(x => package_2.isPathPackageEntry(x))
                .map((e) => ({
                description: {
                    name: e.name || '$ROOT',
                    version: e.version,
                    path: e.path,
                    settings: e.settings,
                },
                definitionPath: definition.definitionPath,
                type: p[0],
                optional: e.optional === true,
            })))).map(async (pkg) => {
                const term = await this.addPathEntry(pkg, hash, parent);
                const key = pkg.optional ? 'optional' : 'required';
                if (!util_1.isDefined(usage[key][pkg.type])) {
                    usage[key][pkg.type] = [];
                }
                usage[key][pkg.type].push([term]);
            }),
        ]);
        return usage;
    }
    async optimize() {
        if (util_1.isDefined(this.assumptions)) {
            this.solution = this.solver.solveAssuming(Logic.and(...this.assumptions));
            this.minimize = this.solution || program_1.update();
        }
        if (!util_1.isDefined(this.solution)) {
            this.solution = this.solver.solve();
        }
        if (!util_1.isDefined(this.solution)) {
            throw new Error('NO solution was found');
        }
        this.solution.ignoreUnknownVariables();
        const minimum = this.minimize
            ? this.solver
                .minimizeWeightedSum(this.solution, this.weights.terms, this.weights.weights)
                .getTrueVars()
            : this.solution.getTrueVars();
        const solution = {
            named: {},
            path: {},
        };
        if (minimum) {
            // make settings stable
            minimum.sort();
            await async_1.settledPromiseAll(minimum.map(async (term) => {
                if (lodash_1.has(this.termMap.named, term)) {
                    const pkg = this.termMap.named[term];
                    if (!axioms_1.get(solution.named, [pkg.package.manifest.type])) {
                        lodash_1.set(solution.named, pkg.package.manifest.type, []);
                    }
                    solution.named[pkg.package.manifest.type].push({
                        id: term,
                        name: pkg.package.fullName,
                        version: pkg.version,
                        hash: pkg.hash,
                        description: pkg.description,
                        settings: this.buildBranch(minimum, term, pkg.package.manifest.type),
                        usage: this.filterUsage(pkg.usage, minimum, 'named', term),
                    });
                }
                else if (lodash_1.has(this.termMap.path, term)) {
                    const pkg = this.termMap.path[term];
                    if (!axioms_1.get(solution.path, [pkg.package.manifest.type])) {
                        lodash_1.set(solution.path, pkg.package.manifest.type, []);
                    }
                    solution.path[pkg.package.manifest.type].push({
                        id: term,
                        name: pkg.package.name,
                        path: pkg.package.source.getPath(),
                        description: pkg.description,
                        root: pkg.root,
                        settings: this.buildBranch(minimum, term, pkg.package.manifest.type),
                        usage: this.filterUsage(pkg.usage, minimum, 'path', term),
                    });
                }
            }));
        }
        this.lockContent = validation_1.validateSchema(solution, undefined, {
            throw: true,
            validator: this.lockValidator,
        });
        return solution;
    }
    filterUsage(usage, minimum, pathOrNamed, id) {
        const fUsage = { settings: {} };
        lodash_1.map(lodash_1.omit(usage, 'settings'), (o, type) => {
            lodash_1.map(o, (usagesList, packageType) => {
                const isBuildDefinition = this.registries.getManifest(packageType).options.isBuildDefinition === true;
                usagesList.forEach(usages => {
                    let filteredUsages = lodash_1.intersection(usages, minimum);
                    if (isBuildDefinition) {
                        if (filteredUsages.length > 1) {
                            throw new Error(`Singular package type ${packageType} has multiple values`);
                        }
                        filteredUsages = lodash_1.first(filteredUsages);
                    }
                    if (filteredUsages) {
                        if (!lodash_1.has(fUsage, [type, packageType])) {
                            lodash_1.set(fUsage, [type, packageType], filteredUsages);
                        }
                    }
                });
            });
        });
        lodash_1.map(this.termMap[pathOrNamed][id].settings, (value, user) => {
            if (!lodash_1.isEmpty(value) && minimum.includes(user)) {
                fUsage.settings[user] = value;
            }
        });
        if (lodash_1.isEmpty(fUsage.settings)) {
            fUsage.settings = undefined;
        }
        return lodash_1.isEmpty(fUsage) ? undefined : fUsage;
    }
    buildBranch(minimum, term, type) {
        // do not merge settings for build definition packages
        if (this.registries
            .getRegistries()
            .filter(x => axioms_1.get(x.options, ['isBuildDefinition']))
            .map(x => x.name)
            .includes(type)) {
            return {};
        }
        const levels = [];
        minimum.map(m => {
            let settings;
            if (lodash_1.has(this.termMap.named, [term, 'settings', m])) {
                settings = axioms_1.get(this.termMap.named, [term, 'settings', m]);
            }
            else if (lodash_1.has(this.termMap.path, [term, 'settings', m])) {
                settings = axioms_1.get(this.termMap.path, [term, 'settings', m]);
            }
            if (!lodash_1.isEmpty(settings)) {
                levels.push({ settings, depth: this.countParents(minimum, m) });
            }
        });
        // @todo: allow merge strategies https://www.npmjs.com/package/deeply#default-behavior
        return lodash_1.merge({}, ...levels.sort((a, b) => a.depth - b.depth).map(l => l.settings));
    }
    countParents(minimum, parent, depth = 0) {
        const parents = [];
        minimum.map(m => {
            let settings;
            if (lodash_1.has(this.termMap.named, [parent, 'settings', m])) {
                settings = axioms_1.get(this.termMap.named, [parent, 'settings', m]);
            }
            else if (lodash_1.has(this.termMap.path, [parent, 'settings', m])) {
                settings = axioms_1.get(this.termMap.path, [parent, 'settings', m]);
            }
            if (util_1.isDefined(settings)) {
                parents.push({ parent: m, depth: this.countParents(minimum, m, depth + 1) });
            }
        });
        if (lodash_1.isEmpty(parents)) {
            return depth;
        }
        else {
            return lodash_1.minBy(parents, p => p.depth).depth;
        }
    }
    addPackageRequirements(value) {
        if (value.hash) {
            if (util_1.isDefined(value.required)) {
                value.required.forEach(r => {
                    this.solver.require(Logic.implies(value.hash, Logic.exactlyOne(...r)));
                });
            }
            if (util_1.isDefined(value.optional)) {
                value.optional.forEach(r => {
                    this.solver.require(Logic.implies(value.hash, Logic.atMostOne(...r)));
                });
            }
        }
        else {
            if (util_1.isDefined(value.required)) {
                value.required.forEach(r => {
                    this.solver.require(Logic.exactlyOne(...r));
                });
            }
            if (util_1.isDefined(value.optional)) {
                value.optional.forEach(r => {
                    this.solver.require(Logic.atMostOne(...r));
                });
            }
        }
    }
    async addPackageVersions(hash, versions, pkg) {
        const newVersions = versions.map(v => ({
            version: v,
            term: this.toTerm(hash, v.version),
            added: false,
        }));
        const newTerms = lodash_1.unzip(lodash_1.reverse(await async_1.settledPromiseAll(newVersions.map(async (v) => {
            const definition = await pkg.source.definitionResolver.getPackageDefinition(v.version.hash);
            if (!lodash_1.has(this.termMap.named, [v.term, 'package'])) {
                this.termMap.named[v.term] = {
                    package: pkg,
                    version: v.version.version.toString(),
                    hash: v.version.hash,
                    description: definition.description,
                    usage: {
                        optional: {},
                        required: {},
                    },
                    settings: {},
                };
                v.added = true;
            }
            return [v.term, v.version.version.cost];
        }))));
        await async_1.settledPromiseAll(newVersions.map(async (v) => {
            if (v.added) {
                const usage = await this.addDefinition(v.term, await pkg.source.definitionResolver.getPackageDefinition(v.version.hash), { package: pkg, hash });
                this.termMap.named[v.term].usage = usage;
            }
        }));
        if (!lodash_1.isEmpty(newTerms[0]) && !lodash_1.isEmpty(newTerms[1])) {
            this.weights.terms = lodash_1.concat(this.weights.terms || [], newTerms[0]);
            this.weights.weights = lodash_1.concat(this.weights.weights || [], newTerms[1]);
            // this.solver.require(Logic.atMostOne(...newTerms[0]))
        }
        return { versions: newVersions };
    }
    async getLockFile() {
        const file = this.getLockFilePath();
        let content;
        if (await fs_extra_1.pathExists(file)) {
            try {
                content = await io_1.loadJson(file);
                content = validation_1.validateSchema(content, undefined, {
                    throw: true,
                    validator: this.lockValidator,
                });
            }
            catch (e) {
                logger_1.logger.warn('Lock file format is invalid, generating a new one...');
                content = undefined;
            }
        }
        return content;
    }
    getLockFilePath() {
        return upath_1.join(environment_1.environment.directory.workingdir, '.zpm.lock');
    }
    async addPathEntry(pkg, hash, parent) {
        const name = pkg.description.name;
        if (util_1.isDefined(name) && name !== '$ROOT') {
            return this.addNamedPathEntry(pkg, hash);
        }
        const absolutePath = upath_1.normalize(upath_1.join(...(parent.package.options.root
            ? [parent.package.entry.path]
            : []), pkg.description.path));
        const rootHash = parent.package.options.rootHash || parent.hash;
        const added = this.registries.addPackage(pkg.type, {
            path: absolutePath,
            name,
        }, {
            rootHash,
            root: parent.package.options.root || parent.package,
            isRoot: false,
            parent: parent.package,
            type: package_1.PackageType.Path,
        });
        try {
            await added.load();
        }
        catch (error) {
            logger_1.logger.error(`Failed to load the definition of the root package:\n\n${error.message}\n${error.stack}`);
        }
        await this.addPackage(added, { root: rootHash });
        const fname = added.getHash();
        if (!lodash_1.has(this.termMap.path, [fname, 'settings', hash])) {
            lodash_1.set(this.termMap.path, [fname, 'settings', hash], pkg.description.settings);
        }
        return fname;
    }
    async addNamedPathEntry(pkg, hash) {
        const absolutePath = pkg.description.path;
        const name = pkg.description.name;
        const { found: root } = await this.addNamedEntry({
            type: pkg.type,
            description: {
                name,
                version: pkg.description.version || '*',
            },
            definitionPath: pkg.definitionPath,
            optional: false,
        }, hash);
        const options = {
            root,
            parent: root,
            type: package_1.PackageType.Named,
        };
        const added = this.registries.addPackage(pkg.type, {
            path: absolutePath,
            name,
        }, options);
        try {
            await added.load();
        }
        catch (error) {
            logger_1.logger.error(`Failed to load the definition of the root package:\n\n${error.message}\n${error.stack}`);
        }
        await this.addPackage(added);
        const fname = added.getHash();
        if (!lodash_1.has(this.termMap.path, [fname, 'settings', hash])) {
            lodash_1.set(this.termMap.path, [fname, 'settings', hash], pkg.description.settings);
        }
        return fname;
    }
    async addNamedEntry(pkg, hash, parent) {
        const found = await this.registries.search(pkg.type, {
            name: pkg.description.name,
            definition: pkg.description.definition,
            repository: pkg.description.repository,
        });
        if (found) {
            if (parent &&
                ((parent.package.options.root && parent.package.options.root.options.isRoot) ||
                    parent.package.options.isRoot)) {
                // make sure root packages use the right directory
                found.options.absolutePath = upath_1.dirname(pkg.definitionPath);
                const entry = {
                    name: pkg.description.name,
                    repository: found.source.repository,
                    definition: pkg.description.definition || found.source.definition,
                };
                await found.overrideEntry(entry);
            }
            const fhash = found.getHash();
            const versions = await this.addPackage(found);
            const range = new range_1.VersionRange(pkg.description.version);
            const fversions = versions.filter(v => range.satisfies(v.version));
            // use the allowed or otherwise expose errors
            const terms = fversions.map(x => this.toTerm(fhash, x.version));
            if (!lodash_1.isEmpty(terms)) {
                this.addPackageRequirements({
                    hash,
                    required: [terms],
                });
            }
            else if (!lodash_1.isEmpty(versions)) {
                throw new Error(`Required version range '${pkg.description.version}' did not match any version for '${pkg.description.name}'`);
            }
            if (util_1.isDefined(parent)) {
                fversions.forEach(x => {
                    if (!lodash_1.has(this.termMap.named, [this.toTerm(fhash, x.version), 'settings', hash])) {
                        lodash_1.set(this.termMap.named, [this.toTerm(fhash, x.version), 'settings', hash], pkg.description.settings);
                    }
                });
            }
            return { found, terms };
        }
        else {
            throw new Error(`not implemented ${JSON.stringify(pkg)}`);
        }
    }
    async tryInsertPackage(hash) {
        if (!this.loadedCache[hash]) {
            this.loadedCache[hash] = false;
            return true;
        }
        // else {
        //     while (!this.loadedCache[hash]) {
        //         // wait until this path has been resolved
        //         await sleep(1)
        //     }
        // }
        return false;
    }
    unlockPackage(hash) {
        this.loadedCache[hash] = true;
    }
    toTerm(hash, version) {
        return `${hash}@${version.toString()}`;
    }
}
exports.SATSolver = SATSolver;
//# sourceMappingURL=sat-old.js.map