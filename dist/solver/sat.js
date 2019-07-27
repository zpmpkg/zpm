"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const axioms_1 = require("@zefiros/axioms");
const deeply_1 = __importDefault(require("deeply"));
const fs_extra_1 = require("fs-extra");
const graphlib_1 = require("graphlib");
const lodash_1 = require("lodash");
const Logic = __importStar(require("logic-solver"));
const upath_1 = require("upath");
const program_1 = require("../cli/program");
const environment_1 = require("../common/environment");
const io_1 = require("../common/io");
const logger_1 = require("../common/logger");
const util_1 = require("../common/util");
const validation_1 = require("../common/validation");
const internal_1 = require("../package/internal");
const schemas_1 = require("../schemas/schemas");
class SATSolver {
    constructor(registries) {
        this.solver = new Logic.Solver();
        this.weights = { terms: [], weights: [] };
        this.loadedCache = {};
        this.minimize = true;
        this.lockValidator = validation_1.buildSchema(schemas_1.lockFileV1);
        this.registries = registries;
    }
    async load() {
        this.lock = await this.getLockFile();
        try {
            if (util_1.isDefined(this.lock)) {
                // const types: string[] = this.registries.getTypes()
                this.assumptions = [];
                // for (const type of types) {
                for (const version of this.lock.versions) {
                    const found = this.registries.searchByName(version.manifest, version.packageId);
                    if (util_1.isDefined(found)) {
                        await this.addPackage(found);
                        await this.expandTerm(version.versionId);
                        this.assumptions.push(version.versionId);
                    }
                    else {
                        console.log(`failure ${version.versionId}`);
                        // @todo
                    }
                }
                // }
            }
        }
        catch (error) {
            logger_1.logger.error(error);
            this.lock = undefined;
        }
        return true;
    }
    async save() {
        if (util_1.isDefined(this.lock)) {
            await io_1.writeJson(this.getLockFilePath(), this.lock);
        }
    }
    async addPackage(pkg, parent) {
        const versions = await pkg.getVersions();
        const allowedVersions = [];
        this.addNewPackage(pkg, versions, parent, allowedVersions);
        this.addVersionConstraints(parent, allowedVersions);
    }
    addVersionConstraints(parent, allowedVersions) {
        if (parent && !parent.entry.usage.optional) {
            const allowedTerms = allowedVersions.map(v => v.id);
            if (allowedTerms.length > 0) {
                logger_1.logger.debug(`Add constraint ${parent.addedBy.id} => [${allowedTerms.join(', ')}]`);
                this.solver.require(Logic.implies(parent.addedBy.id, Logic.exactlyOne(...allowedTerms)));
            }
        }
    }
    addNewPackage(pkg, versions, parent, allowedVersions) {
        for (const version of versions) {
            if (this.addPackageVersion(version, parent)) {
                allowedVersions.push(version);
                if (parent) {
                    version.dependsOn.push(parent.addedBy.id);
                }
            }
        }
        if (!this.loadedCache[pkg.id]) {
            // for all the versions require at most one of them
            this.solver.require(Logic.exactlyOne(...versions.map(v => v.id)));
            this.loadedCache[pkg.id] = true;
        }
    }
    async expand() {
        logger_1.logger.debug(`Expanding current solution`);
        if (util_1.isDefined(this.assumptions)) {
            this.solution = this.solver.solveAssuming(Logic.and(...this.assumptions));
            // the assumptions were falsified
            if (!util_1.isDefined(this.solution)) {
                this.solution = this.solver.solve();
            }
        }
        else {
            this.solution = this.solver.solve();
        }
        // no valid solution exists in the solution space
        if (!util_1.isDefined(this.solution)) {
            throw new Error('NO solution was found');
        }
        // this.solution.ignoreUnknownVariables()
        const solution = this.solver.minimizeWeightedSum(this.solution, this.weights.terms, this.weights.weights);
        this.assumptions = solution.getTrueVars();
        let open = false;
        if (util_1.isDefined(this.assumptions)) {
            for (const assumption of this.assumptions) {
                open = open || (await this.expandTerm(assumption));
            }
        }
        else {
            // todo define solve strategy
        }
        return open ? this.expand() : false;
    }
    async optimize() {
        if (util_1.isDefined(this.assumptions) && !util_1.isDefined(this.solution)) {
            this.solution = this.solver.solveAssuming(Logic.not(...this.assumptions));
        }
        this.minimize = util_1.isDefined(this.solution) || program_1.update();
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
        if (!minimum) {
            return undefined;
        }
        const nodes = new Map();
        const graph = new graphlib_1.Graph();
        for (const m of minimum) {
            const version = this.registries.getVersion(m);
            if (version) {
                const dependsOn = version.dependsOn.filter(value => -1 !== minimum.indexOf(value));
                const versionLock = {
                    versionId: m,
                    packageId: version.package.info.name,
                    manifest: version.package.info.manifest,
                    version: version.version,
                    usedBy: this.getUsedByLock(version, minimum),
                    settings: {},
                    // the definion is defined since the version is already loaded and expanded
                    definition: version.definition.definition,
                    dependsOn: !lodash_1.isEmpty(dependsOn) ? dependsOn : undefined,
                };
                nodes.set(m, versionLock);
                graph.setNode(m);
            }
            else {
                // @todo
            }
        }
        for (const node of nodes.values()) {
            for (const from of node.dependsOn || []) {
                graph.setEdge(from, node.versionId);
            }
        }
        const sorted = graphlib_1.alg.topsort(graph);
        // reverse because we want the most important values to be merged last (no overwrites)
        const preorder = graphlib_1.alg.preorder(graph, [sorted[0]]).reverse();
        const versions = [];
        const context = {
            useCustomAdapters: deeply_1.default.behaviors.useCustomAdapters,
            array: deeply_1.default.adapters.arraysAppendUnique,
        };
        for (const key of sorted) {
            const node = nodes.get(key);
            const usedBy = node.usedBy.map(u => u.versionId);
            const settingsOrder = preorder.filter(value => -1 !== usedBy.indexOf(value));
            node.settings = deeply_1.default.call(context, {}, ...node.usedBy
                .sort((a, b) => settingsOrder.indexOf(a.versionId) - settingsOrder.indexOf(b.versionId))
                .map(u => u.settings)
                .filter(util_1.isDefined));
            versions.push(node);
        }
        const lock = {
            versions,
        };
        // logger.debug(JSON.stringify(lock, null, 2))
        this.lock = lock;
        return lock;
    }
    getUsedByLock(version, minimum) {
        const builderDefinitionsUsed = new Map();
        const usedByVersions = [];
        for (const [usedBy, usage] of Object.entries(version.usedBy).filter(([isUsedBy]) => minimum.includes(isUsedBy))) {
            const found = this.registries.getVersion(usedBy);
            if (found) {
                const isBuildDefinition = found.package.package.manifest.options.isBuildDefinition === true;
                const packageType = found.package.package.manifest.type;
                if (isBuildDefinition) {
                    if (builderDefinitionsUsed.has(packageType)) {
                        throw new Error(`Singular package type ${packageType} has multiple values`);
                    }
                    builderDefinitionsUsed.set(packageType, true);
                }
                usedByVersions.push({
                    versionId: usedBy,
                    optional: usage.optional,
                    ...(lodash_1.isEmpty(usage.settings) ? {} : { settings: usage.settings }),
                });
            }
            else {
                // @todo
            }
        }
        return usedByVersions;
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
    addPackageVersion(version, usage) {
        if (this.registries.addVersion(version.id, version)) {
            logger_1.logger.debug(`Add package version ${version.id}`);
            this.weights.terms.push(version.id);
            this.weights.weights.push(version.cost);
        }
        if (usage) {
            return version.addUsage(usage);
        }
        return true;
    }
    async expandTerm(term) {
        const version = this.registries.getVersion(term);
        if (!util_1.isDefined(version)) {
            // @todo
            throw new Error(`Term ${term} not found`);
        }
        if (!version.expanded) {
            version.expanded = true;
            logger_1.logger.debug(`Expanding term ${term}`);
            const definition = await version.getDefinition(version);
            for (const required of definition.packages) {
                await this.addEntry(required, version);
            }
            return true;
        }
        return false;
    }
    async addEntry(entry, addedBy) {
        // if sub package
        if (entry.internalDefinitionType === "PSSub" /* PSSub */ ||
            entry.internalDefinitionType === "GSSub" /* GSSub */) {
            const added = this.registries.addPackage(entry.type, internal_1.internalDefinitionSubToInternalEntry(entry), entry.options);
            await this.addPackage(added.package, { entry, addedBy });
        }
        else {
            const found = this.registries.search(entry);
            if (!found.sameType && axioms_1.get(addedBy.package.info.options, ['mayChangeRegistry'])) {
                found.package = this.registries.addPackage(entry.type, internal_1.overrideInternalDefinitionToInternalEntry(entry, found.package ? found.package.info : undefined), internal_1.overrideInternalDefinitionOptions(entry.options, entry, addedBy.package.info), true).package;
            }
            if (found.package) {
                await this.addPackage(found.package, { entry, addedBy });
            }
            else {
                logger_1.logger.warn(`Failed to find '${entry.type}' package '${found.name}'`);
            }
        }
    }
    getLockFilePath() {
        return upath_1.join(environment_1.environment.directory.workingdir, '.zpm.lock');
    }
}
exports.SATSolver = SATSolver;
//# sourceMappingURL=sat.js.map