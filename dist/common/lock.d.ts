export default class AwaitLock {
    acquired: boolean;
    waitingResolvers: Array<() => void>;
    constructor();
    acquire(): Promise<void>;
    release(): void;
    withLock<O>(fn: () => Promise<O>): Promise<O>;
}
