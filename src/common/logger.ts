import Consola from 'consola'

class Logger {
    private consola = Consola

    public fatal(message: any): void {
        this.consola.fatal(message)
    }
    public error(message: any): void {
        this.consola.error(message)
    }
    public warn(message: any): void {
        this.consola.warn(message)
    }
    public log(message: any): void {
        this.consola.log(message)
    }
    public info(message: any): void {
        this.consola.info(message)
    }
    public start(message: any): void {
        this.consola.start(message)
    }
    public success(message: any): void {
        this.consola.success(message)
    }
    public ready(message: any): void {
        this.consola.ready(message)
    }
    public debug(message: any): void {
        this.consola.debug(message)
    }
    public trace(message: any): void {
        this.consola.trace(message)
    }
}

export const logger = new Logger()
