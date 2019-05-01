"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("./common/config");
const environment_1 = require("./common/environment");
const registries_1 = require("./registry/registries");
const builder_1 = require("./builder/builder");
const spinner_1 = require("./cli/spinner");
const logger_1 = require("./common/logger");
const storage_1 = require("./common/storage");
const util_1 = require("./common/util");
const sat_1 = require("./solver/sat");
class ZPM {
    constructor() {
        this.config = new config_1.Configuration();
        this.registries = new registries_1.Registries(this);
    }
    async load() {
        await environment_1.loadEnvironment();
        await storage_1.storage.init({
            dir: environment_1.environment.directory.storage,
        });
        this.config.load();
        await this.registries.load();
        this.root = this.registries.addPackage('libraries', {
            name: '$ROOT',
            path: './',
        }, {
            absolutePath: '$ROOT',
            isRoot: true,
            type: 0 /* Path */,
        });
        try {
            await this.root.load();
        }
        catch (error) {
            logger_1.logger.error(`Failed to load the definition of the root package:\n\n${error.message}\n${error.stack}`);
            return false;
        }
        const solver = new sat_1.SATSolver(this.registries);
        let lockFile;
        try {
            await solver.load();
            spinner_1.spinners.start();
            await solver.addPackage(this.root);
            spinner_1.spinners.stop();
            lockFile = await solver.optimize();
            spinner_1.spinners.stop();
        }
        catch (error) {
            spinner_1.spinners.stop();
            logger_1.logger.error(`Failed to resolve the dependency graph:\n\n${error.stack}`);
            return false;
        }
        if (util_1.isDefined(lockFile)) {
            try {
                spinner_1.spinners.start();
                const builder = new builder_1.Builder(this.registries, this.root, lockFile);
                await builder.load();
                spinner_1.spinners.stop();
                await builder.build();
                spinner_1.spinners.stop();
                await solver.save();
                spinner_1.spinners.stop();
            }
            catch (error) {
                spinner_1.spinners.stop();
                logger_1.logger.error(`Failed to build packages:\n\n${error.stack}`);
                return false;
            }
        }
        else {
            await solver.rollback();
            logger_1.logger.error(`We did not find a valid dependency graph, please check your requirements`);
        }
        return true;
    }
}
exports.ZPM = ZPM;
//# sourceMappingURL=zpm.js.map