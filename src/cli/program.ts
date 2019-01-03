import commander from 'commander'

export function loadCLI() {
    commander
        .version('0.1.0')
        .option('-u, --update', 'Updates dependencies and definitions')
        .option('-H, --headless', 'Automatically accept pulling etc. during version resolution')
        .option('-f, --force', 'Force extraction')

    commander.parse(process.argv)
}

export function update() {
    return commander.update
}

export function force() {
    return commander.force
}

export function headless() {
    return commander.headless
}
