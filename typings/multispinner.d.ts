export = index
declare class index {
    static defaultMaxListeners: any
    static init(): void
    static listenerCount(emitter: any, type: any): any
    static usingDomains: boolean
    constructor(spinners: any, opts?: any)
    frames: any
    frameCount: any
    indentStr: any
    spinners: any
    addListener(type: any, listener: any): any
    allCompleted(): any
    allSuccess(): any
    anyErrors(): any
    complete(spinner: any, state: any): void
    emit(type: any, ...args: any[]): any
    error(spinner: any): void
    eventNames(): any
    getMaxListeners(): any
    listenerCount(type: any): any
    listeners(type: any): any
    loop(): void
    on(type: any, listener: any): any
    once(type: any, listener: any): any
    prependListener(type: any, listener: any): any
    prependOnceListener(type: any, listener: any): any
    removeAllListeners(type: any, ...args: any[]): any
    removeListener(type: any, listener: any): any
    setMaxListeners(n: any): any
    start(): void
    success(spinner: any): void
}
declare namespace index {
    class EventEmitter {
        // Circular reference from index.EventEmitter
        static EventEmitter: any
        static defaultMaxListeners: any
        static init(): void
        static listenerCount(emitter: any, type: any): any
        static usingDomains: boolean
        addListener(type: any, listener: any): any
        emit(type: any, ...args: any[]): any
        eventNames(): any
        getMaxListeners(): any
        listenerCount(type: any): any
        listeners(type: any): any
        on(type: any, listener: any): any
        once(type: any, listener: any): any
        prependListener(type: any, listener: any): any
        prependOnceListener(type: any, listener: any): any
        removeAllListeners(type: any, ...args: any[]): any
        removeListener(type: any, listener: any): any
        setMaxListeners(n: any): any
    }
}
