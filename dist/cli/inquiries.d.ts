import { Omit } from '@zefiros/axioms/omit';
import inquirer from 'inquirer';
declare class Inquisitor {
    private answers;
    private lock;
    constructor();
    ask(name: string, question: Omit<inquirer.Question, 'name'>, options: {
        all?: string;
    }): Promise<string>;
    withLock<O>(fn: () => Promise<O>): Promise<O>;
    private inquire;
}
export declare const inquisitor: Inquisitor;
export declare function askPull(packageName: string): Promise<boolean>;
export declare function askRegistry(registryUrl: string): Promise<boolean>;
export {};
