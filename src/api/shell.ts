import { spawn } from 'child_process'
import { Spinner } from '~/cli/spinner'

async function spawnProcess(command: string, cwd: string, stream: any) {
    const shell = getShell()
    const child = spawn(shell.cmd, [shell.arg, command], {
        stdio: 'pipe',
        cwd,
    })

    if (child.stdout) {
        child.stdout.on('data', (data: any) => {
            stream.write(data)
        })
    }

    if (child.stderr) {
        child.stderr.on('data', (data: any) => {
            stream.write(data)
        })
    }

    const promise = new Promise((resolve, reject) => {
        child.on('error', reject)

        child.on('exit', (code: any) => {
            if (code === 0) {
                resolve()
            } else {
                const err = new Error(`child exited with code ${code}`)
                // err.code = code
                // err.stderr = stderr
                reject(err)
            }
        })
    })
    ;(promise as any).child = child

    return promise
}

function getShell() {
    if (process.platform === 'win32') {
        return { cmd: 'cmd', arg: '/C' }
    } else {
        return { cmd: 'sh', arg: '-c' }
    }
}

export class ShellApi {
    public source: string
    public target: string
    public spinner?: Spinner
    public constructor(source: string, target: string, spinner?: Spinner) {
        this.source = source
        this.target = target
        this.spinner = spinner
    }

    public async exec(command: string) {
        let child: any
        // const stdio = new BufferList(() => {

        // })
        try {
            child = await spawnProcess(command, this.source, this.spinner!.stream)
        } catch (e) {
            throw new Error(`Failed to spawn process ${e.stack}`)
        }
        return child
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