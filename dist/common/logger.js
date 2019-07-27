"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const consola_1 = __importDefault(require("consola"));
const json_stable_stringify_1 = __importDefault(require("json-stable-stringify"));
const lodash_1 = require("lodash");
const winston_1 = __importDefault(require("winston"));
const winston_daily_rotate_file_1 = __importDefault(require("winston-daily-rotate-file"));
const program_1 = require("../cli/program");
const environment_1 = require("./environment");
class Logger {
    constructor() {
        this.logfile = winston_1.default.createLogger({
            level: 'debug',
            format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.json()),
            transports: [
                new winston_daily_rotate_file_1.default({
                    filename: 'error-%DATE%.log',
                    dirname: environment_1.environment.directory.logs,
                    level: 'error',
                }),
                new winston_daily_rotate_file_1.default({
                    filename: 'combined-%DATE%.log',
                    dirname: environment_1.environment.directory.logs,
                }),
            ],
        });
        this.consola = consola_1.default.create({
            level: program_1.verbose() ? 'debug' : undefined,
        });
    }
    fatal(...message) {
        this.logfile.error(message);
        this.consola.fatal(this.stringify(...message));
    }
    error(...message) {
        this.logfile.error(message);
        this.consola.error(this.stringify(...message));
    }
    warn(...message) {
        this.logfile.warn(message);
        this.consola.warn(this.stringify(...message));
    }
    log(...message) {
        this.logfile.info(message);
        this.consola.log(this.stringify(...message));
    }
    info(...message) {
        this.logfile.info(message);
        this.consola.info(this.stringify(...message));
    }
    start(...message) {
        this.logfile.info(message);
        this.consola.start(this.stringify(...message));
    }
    success(...message) {
        this.logfile.info(message);
        this.consola.success(this.stringify(...message));
    }
    ready(...message) {
        this.logfile.info(message);
        this.consola.ready(this.stringify(...message));
    }
    debug(...message) {
        this.logfile.debug(message);
        this.consola.debug(this.stringify(...message));
    }
    trace(...message) {
        this.logfile.debug(message);
        this.consola.trace(this.stringify(...message));
    }
    stringify(...message) {
        let value = [...message];
        if (message.length === 1) {
            value = message[0];
        }
        if (!lodash_1.isObjectLike(value)) {
            return String(value);
        }
        if (value instanceof Error) {
            return value;
        }
        return json_stable_stringify_1.default(value, { space: '  ' });
    }
}
exports.logger = new Logger();
//# sourceMappingURL=logger.js.map