import { existsSync } from 'fs'
import memoize from 'promise-memoize'
import simplegit, { Options } from 'simple-git/promise'
import { shorten } from './util'

export const git = (cwd?: string) => simplegit(cwd)

export async function _pull(
    destination: string,
    remote?: string,
    branch?: string,
    options?: Options
) {
    return git(destination).pull(remote.toString(), branch, options)
}

export async function _fetch(
    destination: string,
    remote?: string,
    branch?: string,
    options?: Options
) {
    return git(destination).fetch(remote.toString(), branch, options)
}

export async function _clone(destination: string, remote: string, options?: string[]) {
    return git()
        .outputHandler((command, stdout, stderr) => {
            stdout.pipe(process.stdout)
            stderr.pipe(process.stderr)
        })
        .clone(remote.toString(), destination, options)
}

export async function _cloneOrPull(destination: string, url: string, branch?: string) {
    if (existsSync(destination)) {
        await git(destination).pull('origin', branch)
    } else {
        await clone(destination, url, ['--progress'])
    }
}

export async function _cloneOrFetch(destination: string, url: string, branch?: string) {
    if (existsSync(destination)) {
        await _fetch(destination, 'origin', branch, { '--prune': null })
        const hash = await getBranchSHA1(destination, getBranch(branch))
        await checkout(destination, hash)
        return { latest: hash }
    } else {
        await _clone(destination, url, [
            '--progress',
            '-c',
            'core.longpaths=true',
            '-q',
            ...(branch ? ['-b', branch] : []),
        ])
    }
}

export async function checkout(destination: string, hash: string) {
    const current = await git(destination).revparse(['HEAD'])
    if (!current.includes(hash)) {
        await git(destination).checkout([hash, '-f'])
    }
}

export async function getBranchSHA1(destination: string, branch?: string) {
    return shorten(await git(destination).revparse([branch]))
}

export function getBranch(name: string) {
    return `origin/${name || 'master'}`
}

export const pull = memoize(_pull)
export const clone = memoize(_clone)
export const cloneOrPull = memoize(_cloneOrPull)
export const cloneOrFetch = memoize(_cloneOrFetch)
