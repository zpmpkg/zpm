import commander from 'commander'

let cliLoaded = false
export function loadCLI() {
    if (!cliLoaded) {
        cliLoaded = true
        commander
            .version('0.1.0')
            .option('-u, --update', 'Updates dependencies and definitions')
            .option('-H, --headless', 'Automatically accept pulling etc. during version resolution')
            .option('-f, --force', 'Force extraction')
            .option('-v, --verbose', 'Show debug logs')
            .option(
                '-p, --path [path]',
                'Specify the directory you want to set as root [path]',
                process.cwd()
            )

        commander.parse(process.argv)
    }
}

loadCLI()

export function update() {
    return commander.update
}

export function force() {
    return commander.force
}

export function headless() {
    return commander.headless
}
export function verbose() {
    return commander.verbose
}

export function workingdir(): string {
    return commander.path
}

export function ci() {
    return process.env.CI
}
