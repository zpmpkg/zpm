"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = __importDefault(require("commander"));
let cliLoaded = false;
function loadCLI() {
    if (!cliLoaded) {
        cliLoaded = true;
        commander_1.default
            .version('0.1.0')
            .option('-u, --update', 'Updates dependencies and definitions')
            .option('-H, --headless', 'Automatically accept pulling etc. during version resolution')
            .option('-f, --force', 'Force extraction')
            .option('-p, --path [path]', 'Specify the directory you want to set as root [path]', process.cwd());
        commander_1.default.parse(process.argv);
    }
}
exports.loadCLI = loadCLI;
loadCLI();
function update() {
    return commander_1.default.update;
}
exports.update = update;
function force() {
    return commander_1.default.force;
}
exports.force = force;
function headless() {
    return commander_1.default.headless;
}
exports.headless = headless;
function workingdir() {
    return commander_1.default.path;
}
exports.workingdir = workingdir;
function ci() {
    return process.env.CI;
}
exports.ci = ci;
//# sourceMappingURL=program.js.map