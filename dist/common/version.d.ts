import { SemVer } from 'semver';
export interface VersionOptions {
    cost?: number;
}
export declare class Version {
    static versionInverse: number;
    static majorVersionCost: number;
    static minorVersionCost: number;
    raw: string | undefined;
    semver: SemVer | undefined;
    tag: string | undefined;
    cost: number;
    isTag: boolean;
    constructor(version: string | undefined, options?: VersionOptions);
    toString(): string;
    private translatePrerelease;
}
export declare function areAllowedTagCharacters(r: string): boolean;
