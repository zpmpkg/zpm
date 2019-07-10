"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const inquirer_1 = __importDefault(require("inquirer"));
const lock_1 = __importDefault(require("../common/lock"));
const util_1 = require("../common/util");
class Inquisitor {
    constructor() {
        this.answers = {};
        this.lock = new lock_1.default();
    }
    async ask(name, question, options) {
        return this.withLock(() => this.inquire(name, { ...question, name: 'answer' }, options));
    }
    async withLock(fn) {
        return this.lock.withLock(fn);
    }
    async inquire(name, question, options) {
        const currentAnswer = this.answers[name];
        if (util_1.isDefined(currentAnswer) && currentAnswer === options.all) {
            return currentAnswer;
        }
        const answer = (await inquirer_1.default.prompt(question));
        this.answers[name] = answer.answer;
        return this.answers[name];
    }
}
exports.inquisitor = new Inquisitor();
async function askPull(packageName) {
    const answer = await exports.inquisitor.ask('askPull', {
        message: `Package ${packageName} was not found in the cache. Do you want to pull ${packageName}`,
        choices: [
            { name: 'All packages not in the cache', value: 'all' },
            { value: 'yes', name: 'yes' },
            { name: 'no', value: 'no' },
        ],
        default: 'all',
        type: 'rawlist',
    }, { all: 'all' });
    return ['yes', 'all'].includes(answer);
}
exports.askPull = askPull;
async function askRegistry(registryUrl) {
    const answer = await exports.inquisitor.ask('askRegistry', {
        message: `Registry ${registryUrl} was not found in the cache. Do you want to pull ${registryUrl}`,
        choices: [
            { name: 'All registries not in the cache', value: 'all' },
            { value: 'yes', name: 'yes' },
            { name: 'no', value: 'no' },
        ],
        default: 'all',
        type: 'rawlist',
    }, { all: 'all' });
    return ['yes', 'all'].includes(answer);
}
exports.askRegistry = askRegistry;
//# sourceMappingURL=inquiries.js.map