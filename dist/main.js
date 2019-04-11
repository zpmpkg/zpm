#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const program_1 = require("./cli/program");
// first thing
program_1.loadCLI();
const logger_1 = require("./common/logger");
const zpm_1 = require("./zpm");
const zpm = new zpm_1.ZPM();
async function main() {
    await zpm.load();
}
main()
    .then(result => {
    logger_1.logger.success('Done');
})
    .catch(error => {
    logger_1.logger.error(error);
});
//# sourceMappingURL=main.js.map