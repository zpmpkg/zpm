import * as fs from 'fs-extra'
import { toSafeInteger } from 'lodash'
import simplegit, { Options } from 'simple-git/promise'
import { storage } from './storage'
import { isDefined, shorten } from './util'

export const git = (cwd?: string) => simplegit(cwd)

export async function _showRef(destination: string, options?: string[]): Promise<string> {
    const extras = options || []
    return git(destination).raw(['show-ref', ...extras])
}

export async function _pull(
    destination: string,
    remote?: string,
    branch?: string,
    options?: Options
) {
    return git(destination).pull(remote, branch, options)
}

export async function _fetch(
    destination: string,
    remote?: string,
    branch?: string,
    options?: Options
) {
    return git(destination).fetch(remote, branch, options)
}

export async function _tags(destination: string, options?: Options) {
    return git(destination).tags(options)
}

export async function _clone(destination: string, remote: string, options?: string[]) {
    return git()
        .outputHandler((command, stdout, stderr) => {
            stdout.pipe(process.stdout)
            stderr.pipe(process.stderr)
        })
        .clone(remote.toString(), destination, options)
}

export interface CloneOrPullResult {
    newCommits?: number
    cloned: boolean
    latest: string
}
export async function _cloneOrPull(
    destination: string,
    url: string,
    branch?: string
): Promise<CloneOrPullResult> {
    const returnValue: CloneOrPullResult = {
        cloned: !(await fs.pathExists(destination)),
        latest: '',
    }
    const key = `git.head.${destination}`
    const hash: string | undefined = await storage.getItem(key)
    if (await fs.pathExists(destination)) {
        await _fetch(destination, 'origin', branch, { '--prune': null })
        const sha = await getBranchSHA1(destination, getBranch(branch))
        await checkout(destination, sha)
        returnValue.latest = sha

        if (hash) {
            returnValue.newCommits = toSafeInteger(
                (await git(destination).raw([
                    'rev-list',
                    '--count',
                    `${hash}...origin/${branch || 'master'}`,
                ])).trim()
            )
        }
    } else {
        returnValue.latest = await clone(destination, url, ['--quiet'])
    }

    return returnValue
}

export interface CloneOrFetchResult {
    newCommits?: number
    cloned: boolean
}

export async function _cloneOrFetch(
    destination: string,
    url: string,
    branch?: string
): Promise<CloneOrFetchResult> {
    const returnValue: CloneOrFetchResult = { cloned: !(await fs.pathExists(destination)) }
    const key = `git.head.${destination}`
    const hash: string | undefined = await storage.getItem(key)
    if (!returnValue.cloned) {
        await _fetch(destination, 'origin', branch, { '--prune': null, '--tags': null })

        if (hash) {
            returnValue.newCommits = toSafeInteger(
                (await git(destination).raw([
                    'rev-list',
                    '--count',
                    `${hash}...origin/${branch || 'master'}`,
                ])).trim()
            )
        }
    } else {
        await _clone(destination, url, [
            '--quiet',
            '--recurse',
            '-v',
            '-j8',
            '-c',
            'core.longpaths=true',
            '-c',
            'core.fscache=true',
            '-q',
            ...(branch ? ['-b', branch] : []),
        ])
    }
    const newHash = await getHash(destination, branch)

    if (newHash !== hash) {
        await storage.setItem(key, newHash)
    }

    return returnValue
}

async function getHash(destination: string, branch?: string) {
    return (await git(destination).revparse([`origin/${branch || 'master'}`])).trim()
}

export async function _getBranchSHA1(destination: string, branch?: string) {
    return shorten(await git(destination).revparse(branch ? [branch] : undefined))
}

export async function _hasSubmodules(destination: string): Promise<boolean> {
    return (
        (await git(destination).raw('config --file .gitmodules --name-only --get-regexp path'))
            .length > 0
    )
}

export async function catFile(
    destination: string,
    options: string[] = []
): Promise<string | undefined> {
    try {
        const result = await git(destination)
            .silent(true)
            .catFile(options)
        return result
    } catch (error) {
        return undefined
    }
}

export async function checkout(destination: string, hash: string) {
    const current = await git(destination).revparse(['HEAD'])
    if (!current.includes(hash)) {
        await git(destination).checkout([hash, '-f'])
        if (await _hasSubmodules(destination)) {
            await git(destination).submoduleInit([
                '--recursive',
                '-j8',
                '--recommend-shallow',
                '--force',
            ])
        }
    }
}

export function getBranch(name?: string): string | undefined {
    if (isDefined(name)) {
        return `origin/${name || 'master'}`
    }
    return undefined
}

export const pull: typeof _pull = _pull // currently disabled: memoize(_pull)
export const clone: typeof _clone = _clone // currently disabled: memoize(_clone)
export const cloneOrPull: typeof _cloneOrPull = _cloneOrPull // currently disabled: memoize(_cloneOrPull)
export const cloneOrFetch: typeof _cloneOrFetch = _cloneOrFetch // currently disabled: memoize(_cloneOrFetch)
export const tags: typeof _tags = _tags // currently disabled: memoize(_tags)
export const showRef: typeof _showRef = _showRef // currently disabled: memoize(_showRef)
export const getBranchSHA1: typeof _getBranchSHA1 = _getBranchSHA1 // currently disabled: memoize(_getBranchSHA1)
