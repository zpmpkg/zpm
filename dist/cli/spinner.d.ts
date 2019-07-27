import { WritableStreamBuffer } from 'stream-buffers';
export declare class Spinner {
    stream: WritableStreamBuffer;
    spinner: any;
    text: string;
    suffix: string;
    frame: string;
    frameIndex: number;
    running: boolean;
    children: Spinner[];
    constructor(text?: string);
    write(data: any): void;
    render(): string;
    addChild(text?: string): Spinner;
    stop(): void;
    update(text: string): void;
    stopAndPersist(options?: {
        text?: string;
        symbol?: string;
    }): void;
    succeed(text?: string): void;
    fail(text?: string): void;
    warn(text?: string): void;
    info(text?: string): void;
}
export declare class Spinners {
    interval: number;
    spinners: Spinner[];
    id: any;
    create(options: {
        text?: string;
        start?: boolean;
    }): Spinner;
    start(): this;
    render(): void;
    stop(): void;
}
export declare const spinners: Spinners;
