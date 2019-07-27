export async function extract() {
    const includes = version.usage.include || version.global.extractor.include
    const excludes = version.usage.exclude || version.global.extractor.exclude
    await fs.copy(includes, {
        excludes,
    })
}

export async function checkout() {
    await git.checkout(version.hash!)
}
