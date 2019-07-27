"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axioms_1 = require("@zefiros/axioms");
const config_1 = require("./common/config");
const environment_1 = require("./common/environment");
const registries_1 = require("./registry/registries");
const builder_1 = require("./builder/builder");
const spinner_1 = require("./cli/spinner");
const logger_1 = require("./common/logger");
const storage_1 = require("./common/storage");
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
        const rootEntry = {};
        const rootOptions = {
            alias: 'ROOT',
            rootName: 'ROOT',
            rootDirectory: environment_1.environment.directory.workingdir,
            allowDevelopment: true,
            mayChangeRegistry: true,
        };
        this.root = this.registries.addPackage('libraries', rootEntry, rootOptions).package;
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
            spinner_1.spinners.start();
            await solver.addPackage(this.root);
            await solver.load();
            await solver.expand();
            spinner_1.spinners.stop();
            lockFile = await solver.optimize();
            spinner_1.spinners.stop();
        }
        catch (error) {
            spinner_1.spinners.stop();
            logger_1.logger.error(`Failed to resolve the dependency graph:\n\n${error.stack}`);
            return false;
        }
        if (axioms_1.isDefined(lockFile)) {
            try {
                spinner_1.spinners.start();
                const builder = new builder_1.Builder(this.registries, lockFile);
                builder.load();
                await builder.build();
                spinner_1.spinners.stop();
                await solver.save();
            }
            catch (error) {
                spinner_1.spinners.stop();
                logger_1.logger.error(`Failed to build packages:\n\n${error.stack}`);
                return false;
            }
        }
        else {
            logger_1.logger.error(`We did not find a valid dependency graph, please check your requirements`);
        }
        return true;
    }
}
exports.ZPM = ZPM;
//# sourceMappingURL=zpm.js.map