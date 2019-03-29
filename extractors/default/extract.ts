export async function extract() {
    const includes = pkg.usage.includes || pkg.globals.extractor.includes
    const excludes = pkg.usage.excludes || pkg.globals.extractor.excludes
    await fs.copy(includes, {
        excludes,
    })
}

export async function checkout() {
    await git.checkout(pkg.hash!)
}
