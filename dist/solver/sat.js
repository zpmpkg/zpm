"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = require("fs-extra");
const Logic = __importStar(require("logic-solver"));
const upath_1 = require("upath");
const program_1 = require("../cli/program");
const environment_1 = require("../common/environment");
const io_1 = require("../common/io");
const logger_1 = require("../common/logger");
const util_1 = require("../common/util");
const validation_1 = require("../common/validation");
const schemas_1 = require("../schemas/schemas");
class SATSolver {
    constructor(registries) {
        this.solver = new Logic.Solver();
        this.weights = { terms: [], weights: [] };
        this.loadedCache = {};
        this.versionMap = new Map();
        this.minimize = true;
        this.lockValidator = validation_1.buildSchema(schemas_1.lockFileV1);
        this.registries = registries;
    }
    async load() {
        return true;
    }
    async save() { }
    async rollback() {
        //
    }
    async addPackage(pkg, parent) {
        const versions = await pkg.getVersions();
        const allowedVersions = [];
        if (!this.loadedCache[pkg.id]) {
            for (const version of versions) {
                if (this.addPackageVersion(version, parent)) {
                    allowedVersions.push(version);
                }
            }
            // for all the versions require at most one of them
            this.solver.require(Logic.exactlyOne(...versions.map(v => v.id)));
            this.loadedCache[pkg.id] = true;
        }
        if (parent) {
            const allowedTerms = allowedVersions.map(v => v.id);
            this.solver.require(Logic.implies(parent.addedBy.id, Logic.exactlyOne(...allowedTerms)));
        }
    }
    async expand() {
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
        //this.solution.ignoreUnknownVariables()
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
        if (!this.versionMap.has(version.id)) {
            this.versionMap.set(version.id, version);
            this.weights.terms.push(version.id);
            this.weights.weights.push(version.cost);
        }
        if (usage) {
            return version.addUsage(usage);
        }
        return true;
    }
    async expandTerm(term) {
        const version = this.versionMap.get(term);
        if (!version.expanded) {
            version.expanded = true;
            const definition = await version.getDefinition();
            for (const required of definition.packages) {
                await this.addEntry(required, version);
            }
            return true;
        }
        return false;
    }
    async addEntry(entry, addedBy) {
        const found = this.registries.search(entry);
        if (found.package) {
            await this.addPackage(found.package, { entry, addedBy });
        }
        else {
            logger_1.logger.warn(`Failed to find '${entry.type}' package '${found.name}'`);
        }
    }
    getLockFilePath() {
        return upath_1.join(environment_1.environment.directory.workingdir, '.zpm.lock');
    }
}
exports.SATSolver = SATSolver;
//# sourceMappingURL=sat.js.map