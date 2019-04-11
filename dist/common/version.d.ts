import { SemVer } from 'semver';
export interface VersionOptions {
    cost?: number;
}
export declare class Version {
    raw: string | undefined;
    semver: SemVer | undefined;
    tag: string | undefined;
    cost: number;
    isTag: boolean;
    constructor(version: string | undefined, options?: VersionOptions);
    toString(): string;
}
export declare function areAllowedTagCharacters(r: string): boolean;
