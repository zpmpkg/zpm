export async function extract() {
    await fs.copy(pkg.settings.includes, {
        excludes: pkg.settings.excludes,
    })
}

export async function checkout() {
    await git.checkout(pkg.hash!)
}
