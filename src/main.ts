import { ZPM } from '~/zpm'
import { logger } from './common/logger'

const zpm = new ZPM()

async function main() {
    await zpm.load()
}

main()
    .then(result => {
        logger.info('Done')
    })
    .catch(error => {
        logger.error(error)
    })
