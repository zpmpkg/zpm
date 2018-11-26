import { readFile } from 'async-file'
import * as Parallel from 'async-parallel'
import fg from 'fast-glob'
import * as fs from 'fs-extra'
import { safeLoad } from 'js-yaml'
import { filter } from 'lodash'
import path from 'path'
import { join, relative } from 'upath'
import { logger } from '~/common/logger'

export async function loadJsonOrYaml(file: string) {
    const content = await readFile(file)
    if (file.endsWith('json')) {
        return JSON.parse(content.toString())
    }
    return safeLoad(content.toString())
}

export async function copy(source: string | string[], root: string, destination: string) {
    const files = filter(
        (await fg.async(source, {
            cwd: root,
            absolute: true,
        })).map(f => f.toString()),
        f => isSubDirectory(f, root)
    )
    console.log(source)
    await Parallel.each(
        files,
        async file => {
            await fs.copy(
                file,
                join(destination, relative(root, file)),
                {
                    // overwrite: true,
                    preserveTimestamps: true,
                },
                e => {
                    if (e) {
                        logger.error(e)
                    }
                }
            )
            // console.log()
        },
        16
    )
    console.log('done')
}
export function isSubDirectory(child: string, parent: string) {
    child = path.resolve(child)
    parent = path.resolve(parent)
    return relative(child, parent).startsWith('..')
}
