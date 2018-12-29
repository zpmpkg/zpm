import AppDirectory from 'appdirectory'
import * as Parallel from 'async-parallel'
import * as fs from 'fs-extra'
import { join } from 'upath'

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
        registries: join(userCache(), 'registries'),
        storage: join(userCache(), 'storage'),
        packages: join(userCache(), 'packages'),
        extract: join(process.cwd(), 'extern'),
    },
}

export async function loadEnvironment() {
    const directories = [userData(), userConfig(), userCache(), userLogs()]
    await Parallel.each(directories, async d => {
        if (!(await fs.pathExists(d))) {
            await fs.ensureDir(d)
        }
    })
}
