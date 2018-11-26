import { ZPM } from '~/zpm'

const zpm = new ZPM()

async function main() {
    await zpm.load()
}

main()
