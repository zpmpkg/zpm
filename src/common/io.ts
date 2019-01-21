import fg from 'fast-glob'
import * as fs from 'fs-extra'
import { safeLoadAll } from 'js-yaml'
import { filter } from 'lodash'
import path from 'path'
import { join, relative } from 'upath'

export async function loadJson(file: string) {
    const content = await fs.readFile(file)
    return JSON.parse(content.toString())
}

export async function loadJsonOrYaml(file: string) {
    const content = await fs.readFile(file)
    if (file.endsWith('json')) {
        return JSON.parse(content.toString())
    }
    return safeLoadAll(content.toString())
}
export async function writeJson(file: string, object: any) {
    await fs.writeFile(file, JSON.stringify(object, undefined, 2))
    return true
}

export async function copy(source: string | string[], root: string, destination: string) {
    const files = filter(
        (await fg.async(source, {
            cwd: root,
            absolute: true,
        })).map(f => f.toString()),
        f => isSubDirectory(f, root)
    )
    await Promise.all(
        files.map(async file => {
            await fs.copy(file, join(destination, relative(root, file)), {
                preserveTimestamps: true,
            })
        })
    )
}

export function isSubDirectory(child: string, parent: string) {
    child = path.resolve(child)
    parent = path.resolve(parent)
    return relative(child, parent).startsWith('..')
}
