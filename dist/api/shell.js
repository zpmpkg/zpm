"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
async function spawnProcess(command, cwd, stream) {
    const shell = getShell();
    const child = child_process_1.spawn(shell.cmd, [shell.arg, command], {
        stdio: 'pipe',
        cwd,
    });
    if (child.stdout) {
        child.stdout.on('data', (data) => {
            stream.write(data);
        });
    }
    if (child.stderr) {
        child.stderr.on('data', (data) => {
            stream.write(data);
        });
    }
    const promise = new Promise((resolve, reject) => {
        child.on('error', reject);
        child.on('exit', (code) => {
            if (code === 0) {
                resolve();
            }
            else {
                const err = new Error(`child exited with code ${code}`);
                // err.code = code
                // err.stderr = stderr
                reject(err);
            }
        });
    });
    promise.child = child;
    return promise;
}
function getShell() {
    if (process.platform === 'win32') {
        return { cmd: 'cmd', arg: '/C' };
    }
    else {
        return { cmd: 'sh', arg: '-c' };
    }
}
class ShellApi {
    constructor(source, target, spinner) {
        this.source = source;
        this.target = target;
        this.spinner = spinner;
    }
    async exec(command) {
        let child;
        // const stdio = new BufferList(() => {
        // })
        try {
            child = await spawnProcess(command, this.source, this.spinner.stream);
        }
        catch (e) {
            throw new Error(`Failed to spawn process ${e.stack}`);
        }
        return child;
        // if (this.spinner && child.stdout) {
        //     child.stdout.on('data', data => {
        //         this.spinner!.stream.write(data)
        //     })
        // }
        // if (this.spinner && child.stderr) {
        //     child.stderr.on('data', data => {
        //         logger.error(data)
        //     })
        // }
        // const promise = new Promise((resolve, reject) => {
        //     if (isDefined(child)) {
        //         child.on('error', error => {
        //             logger.error(error)
        //             reject(error)
        //         })
        //         child.on('exit', (code: any) => {
        //             if (code === 0) {
        //                 logger.info(
        //                     '%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%'
        //                 )
        //                 resolve(code)
        //             } else {
        //                 logger.info(
        //                     '&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&'
        //                 )
        //                 throw new Error(`child exited with code ${code}`)
        //             }
        //         })
        //     } else {
        //         throw new Error('Failed to spawn process')
        //     }
        // })
    }
}
exports.ShellApi = ShellApi;
//# sourceMappingURL=shell.js.map