import { ZPM } from '~/zpm'
import { logger } from './common/logger'

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
