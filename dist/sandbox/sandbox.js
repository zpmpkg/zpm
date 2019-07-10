"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs-extra"));
const ts = __importStar(require("typescript"));
const vm2_1 = require("vm2");
const logger_1 = require("../common/logger");
async function executeSandboxTypescript(file, sandbox) {
    const vm = new vm2_1.NodeVM({
        sandbox: {
            log: logger_1.logger,
            ...sandbox,
        },
        compiler: (code) => {
            const result = ts.transpileModule(code.code, {
                compilerOptions: {
                    target: ts.ScriptTarget.ES2016,
                    module: ts.ModuleKind.CommonJS,
                },
            });
            return result.outputText;
        },
    });
    const source = await fs.readFile(file);
    try {
        const script = new vm2_1.VMScript(source.toString(), file);
        return vm.run(script);
    }
    catch (err) {
        logger_1.logger.error(`Failed to run script: ${err.message}`);
    }
}
exports.executeSandboxTypescript = executeSandboxTypescript;
//# sourceMappingURL=sandbox.js.map