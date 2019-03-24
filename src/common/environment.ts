import AppDirectory from 'appdirectory'
import * as fs from 'fs-extra'
import { join, resolve } from 'upath'
import { workingdir } from '~/cli/program'
import { settledPromiseAll } from './async'

const dirs = new AppDirectory({ appName: 'zpm', appAuthor: 'Zefiros' })

export function userData() {
    return dirs.userData()
}

export function userConfig() {
    return dirs.userConfig()
}

export function userCache() {
    return dirs.userCache()
}

export function userLogs() {
    return dirs.userLogs()
}

export const environment = {
    directory: {
        configuration: userConfig(),
        logs: userLogs(),
        registries: join(userCache(), 'registries'),
        storage: join(userCache(), 'storage'),
        packages: join(userCache(), 'packages'),
        extract: join(workingdir(), 'extern'),
        zpm: join(__dirname, '../../'),
        workingdir: resolve(workingdir()),
    },
}

export async function loadEnvironment() {
    const directories = [userData(), userConfig(), userCache(), userLogs()]
    await settledPromiseAll(
        directories.map(async d => {
            if (!(await fs.pathExists(d))) {
                await fs.ensureDir(d)
            }
        })
    )
}
