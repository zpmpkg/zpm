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
const appdirectory_1 = __importDefault(require("appdirectory"));
const fs = __importStar(require("fs-extra"));
const upath_1 = require("upath");
const program_1 = require("../cli/program");
const async_1 = require("./async");
const dirs = new appdirectory_1.default({ appName: 'zpm', appAuthor: 'Zefiros' });
function userData() {
    return dirs.userData();
}
exports.userData = userData;
function userConfig() {
    return dirs.userConfig();
}
exports.userConfig = userConfig;
function userCache() {
    return dirs.userCache();
}
exports.userCache = userCache;
function userLogs() {
    return dirs.userLogs();
}
exports.userLogs = userLogs;
exports.environment = {
    directory: {
        configuration: userConfig(),
        logs: userLogs(),
        registries: upath_1.join(userCache(), 'registries'),
        storage: upath_1.join(userCache(), 'storage'),
        packages: upath_1.join(userCache(), 'packages'),
        extract: upath_1.join(program_1.workingdir(), 'extern'),
        zpm: upath_1.join(__dirname, '../../'),
        workingdir: upath_1.resolve(program_1.workingdir()),
    },
};
async function loadEnvironment() {
    const directories = [userData(), userConfig(), userCache(), userLogs()];
    await async_1.settledPromiseAll(directories.map(async (d) => {
        if (!(await fs.pathExists(d))) {
            await fs.ensureDir(d);
        }
    }));
}
exports.loadEnvironment = loadEnvironment;
//# sourceMappingURL=environment.js.map