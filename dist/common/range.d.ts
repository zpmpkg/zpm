import { Version } from './version';
export declare class VersionRange {
    semverMatcher: string | undefined;
    tags: string[];
    constructor(range: string);
    satisfies(version: Version | string): boolean;
}
