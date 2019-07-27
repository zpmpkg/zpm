"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cli_spinners_1 = __importDefault(require("cli-spinners"));
const figures_1 = __importDefault(require("figures"));
const log_symbols_1 = __importDefault(require("log-symbols"));
const log_update_1 = __importDefault(require("log-update"));
const stream_buffers_1 = require("stream-buffers");
const logger_1 = require("../common/logger");
const program_1 = require("./program");
class Spinner {
    constructor(text = '') {
        this.stream = new stream_buffers_1.WritableStreamBuffer();
        this.suffix = '';
        this.frame = '';
        this.frameIndex = 0;
        this.running = true;
        this.children = [];
        this.spinner = cli_spinners_1.default.dots;
        this.text = text;
    }
    write(data) {
        if (this.stream) {
            this.stream.write(data);
        }
    }
    render() {
        const oldFrame = this.frame;
        if (this.running) {
            if (this.stream.size() > 0) {
                const sstream = this.stream.getContentsAsString();
                if (sstream) {
                    this.suffix = sstream
                        .trimRight()
                        .split(/\n+/)
                        .pop()
                        .split(/\r+/)
                        .pop();
                }
            }
            const frame = this.spinner.frames[this.frameIndex];
            this.frameIndex = ++this.frameIndex % this.spinner.frames.length;
            this.frame = this.text
                ? `${frame} ${this.text} ${this.suffix}`
                : `${frame} ${this.suffix}`;
        }
        else {
            this.frame = this.text;
        }
        const childText = this.children.map(c => c.render()).map(t => `  ${figures_1.default.play} ${t}\n`);
        this.frame = `${this.frame}\n${childText}`.trimRight();
        if (oldFrame !== this.frame) {
            logger_1.logger.logfile.info(this.frame);
        }
        return this.frame;
    }
    addChild(text) {
        const child = new Spinner(text);
        this.children.push(child);
        return child;
    }
    stop() {
        this.running = false;
    }
    update(text) {
        this.text = text;
    }
    stopAndPersist(options = {}) {
        this.running = false;
        this.text = `${options.symbol || ' '} ${options.text || this.text}`;
    }
    succeed(text) {
        this.stopAndPersist({ text, symbol: log_symbols_1.default.success });
    }
    fail(text) {
        this.stopAndPersist({ text, symbol: log_symbols_1.default.error });
    }
    warn(text) {
        this.stopAndPersist({ text, symbol: log_symbols_1.default.warning });
    }
    info(text) {
        this.stopAndPersist({ text, symbol: log_symbols_1.default.info });
    }
}
exports.Spinner = Spinner;
class Spinners {
    constructor() {
        this.interval = 80;
        this.spinners = [];
    }
    create(options) {
        const { text, start } = {
            start: true,
            ...options,
        };
        const added = new Spinner(text);
        this.spinners.push(added);
        if (start) {
            this.start();
        }
        return added;
    }
    start() {
        this.render();
        if (!program_1.ci() && !this.id) {
            this.id = setInterval(this.render.bind(this), this.interval);
        }
        return this;
    }
    render() {
        this.spinners.forEach(s => {
            s.render();
        });
        const content = this.spinners
            .map(s => {
            return s.frame;
        })
            .join('\n');
        if (content.length > 0) {
            log_update_1.default(content);
        }
    }
    stop() {
        if (!program_1.ci() && this.id) {
            clearInterval(this.id);
            this.id = undefined;
        }
        this.spinners.forEach(s => {
            s.stop();
        });
        this.render();
        log_update_1.default.done();
        this.spinners = [];
    }
}
exports.Spinners = Spinners;
exports.spinners = new Spinners();
//# sourceMappingURL=spinner.js.map