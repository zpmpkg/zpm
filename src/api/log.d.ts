export interface LoggerApi {
    fatal(...message: any[]): void
    error(...message: any[]): void

    warn(...message: any[]): void

    log(...message: any[]): void

    info(...message: any[]): void

    start(...message: any[]): void

    success(...message: any[]): void

    ready(...message: any[]): void

    debug(...message: any[]): void

    trace(...message: any[]): void
}

declare const log: LoggerApi
