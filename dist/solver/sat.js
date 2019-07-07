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
        this.versionMap = {};
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
    async addPackage(pkg) {
        const versions = await pkg.getVersions();
        for (const version of versions) {
            await this.addPackageVersion(version);
        }
        this.solver.require(Logic.exactlyOne(...versions.map(v => v.id)));
        this.expandSolution();
        // if (this.mayLoadPackage(hash)) {
        // if (versions.length > 0) {
        //     await this.addPackageVersions(hash, versions, pkg)
        // } else {
        //     const definition = await pkg.source.definitionResolver.getPackageDefinition()
        //     let hasLock = false
        //     if (!has(this.termMap.path, [hash, 'package'])) {
        //         this.termMap.path[hash] = {
        //             package: pkg,
        //             description: definition.description,
        //             usage: {
        //                 required: {},
        //                 optional: {},
        //             },
        //             settings: {},
        //             ...extra,
        //         }
        //         hasLock = true
        //     }
        //     const usage = await this.addDefinition(hash, definition, { package: pkg, hash })
        //     if (hasLock) {
        //         this.termMap.path[hash].usage = usage
        //     }
        //     //console.log(hash, '@')
        //     this.solver.require(Logic.exactlyOne(hash))
        // }
        // await this.addDefinition(hash, pkg.resolver.definitionResolver.getPackageDefinition())
        // }
    }
    async expand() { }
    async addPackageVersion(version) {
        const definition = await version.getDefinition();
        this.versionMap[version.id] = version;
        this.weights.terms.push(version.id);
        this.weights.weights.push(version.cost);
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
    addPackageRequirements(value) {
        // if (value.hash) {
        //     if (isDefined(value.required)) {
        //         value.required.forEach(r => {
        //             this.solver.require(Logic.implies(value.hash, Logic.exactlyOne(...r)))
        //         })
        //     }
        //     if (isDefined(value.optional)) {
        //         value.optional.forEach(r => {
        //             this.solver.require(Logic.implies(value.hash, Logic.atMostOne(...r)))
        //         })
        //     }
        // } else {
        //     if (isDefined(value.required)) {
        //         value.required.forEach(r => {
        //             this.solver.require(Logic.exactlyOne(...r))
        //         })
        //     }
        //     if (isDefined(value.optional)) {
        //         value.optional.forEach(r => {
        //             this.solver.require(Logic.atMostOne(...r))
        //         })
        //     }
        // }
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
    expandSolution() {
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
        this.solution.ignoreUnknownVariables();
        const solution = this.solver.minimizeWeightedSum(this.solution, this.weights.terms, this.weights.weights);
        solution.getTrueVars();
    }
    getLockFilePath() {
        return upath_1.join(environment_1.environment.directory.workingdir, '.zpm.lock');
    }
    mayLoadPackage(hash) {
        if (!this.loadedCache[hash]) {
            this.loadedCache[hash] = false;
            return true;
        }
        return false;
    }
}
exports.SATSolver = SATSolver;
//# sourceMappingURL=sat.js.map