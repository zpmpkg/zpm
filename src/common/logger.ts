import Consola from 'consola'
import stringify from 'json-stable-stringify'
import { isObjectLike } from 'lodash'
import winston from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'
import { verbose } from '~/cli/program'
import { environment } from './environment'

class Logger {
    public logfile: winston.Logger = winston.createLogger({
        level: 'debug',
        format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
        transports: [
            new DailyRotateFile({
                filename: 'error-%DATE%.log',
                dirname: environment.directory.logs,
                level: 'error',
            }),
            new DailyRotateFile({
                filename: 'combined-%DATE%.log',
                dirname: environment.directory.logs,
            }),
        ],
    })
    private consola = Consola.create({
        level: verbose() ? 4 : undefined,
    })

    public fatal(...message: any[]): void {
        this.logfile.error(message)
        this.consola.fatal(this.stringify(...message))
    }
    public error(...message: any[]): void {
        this.logfile.error(message)
        this.consola.error(this.stringify(...message))
    }
    public warn(...message: any[]): void {
        this.logfile.warn(message)
        this.consola.warn(this.stringify(...message))
    }
    public log(...message: any[]): void {
        this.logfile.info(message)
        this.consola.log(this.stringify(...message))
    }
    public info(...message: any[]): void {
        this.logfile.info(message)
        this.consola.info(this.stringify(...message))
    }
    public start(...message: any[]): void {
        this.logfile.info(message)
        this.consola.start(this.stringify(...message))
    }
    public success(...message: any[]): void {
        this.logfile.info(message)
        this.consola.success(this.stringify(...message))
    }
    public ready(...message: any[]): void {
        this.logfile.info(message)
        this.consola.ready(this.stringify(...message))
    }
    public debug(...message: any[]): void {
        this.logfile.debug(message)
        this.consola.debug(this.stringify(...message))
    }
    public trace(...message: any[]): void {
        this.logfile.debug(message)
        this.consola.trace(this.stringify(...message))
    }

    private stringify(...message: any[]): string | any {
        let value: any = [...message]
        if (message.length === 1) {
            value = message[0]
        }
        if (!isObjectLike(value)) {
            return String(value)
        }
        if (value instanceof Error) {
            return value
        }
        return stringify(value, { space: '  ' })
    }
}

export const logger = new Logger()
