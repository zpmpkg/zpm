#!/usr/bin/env node
import { loadCLI } from './cli/program'
// first thing
loadCLI()

import { logger } from './common/logger'
import { ZPM } from './zpm'

const zpm = new ZPM()

async function main() {
    await zpm.load()
}

main()
    .then(result => {
        logger.success('Done')
    })
    .catch(error => {
        logger.error(error)
    })
