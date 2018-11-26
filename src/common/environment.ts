import AppDirectory from 'appdirectory'
import * as fs from 'async-file'
import * as Parallel from 'async-parallel'
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
        packages: join(userCache(), 'packages'),
        extract: join(process.cwd(), 'extern'),
    },
}

export async function loadEnvironment() {
    const directories = [userData(), userConfig(), userCache(), userLogs()]
    await Parallel.each(directories, async d => {
        if (!(await fs.exists(d))) {
            await fs.mkdirp(d, 744)
        }
    })
}
