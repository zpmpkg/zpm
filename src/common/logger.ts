import Consola from 'consola'
import { isObjectLike } from 'lodash'

class Logger {
    private consola = Consola

    public fatal(...message: any[]): void {
        this.consola.fatal(this.stringify(...message))
    }
    public error(...message: any[]): void {
        this.consola.error(this.stringify(...message))
    }
    public warn(...message: any[]): void {
        this.consola.warn(this.stringify(...message))
    }
    public log(...message: any[]): void {
        this.consola.log(this.stringify(...message))
    }
    public info(...message: any[]): void {
        this.consola.info(this.stringify(...message))
    }
    public start(...message: any[]): void {
        this.consola.start(this.stringify(...message))
    }
    public success(...message: any[]): void {
        this.consola.success(this.stringify(...message))
    }
    public ready(...message: any[]): void {
        this.consola.ready(this.stringify(...message))
    }
    public debug(...message: any[]): void {
        this.consola.debug(this.stringify(...message))
    }
    public trace(...message: any[]): void {
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
        return JSON.stringify(value, undefined, 2)
    }
}

export const logger = new Logger()
