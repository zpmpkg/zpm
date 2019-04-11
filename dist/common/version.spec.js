"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const semver_1 = require("semver");
const version_1 = require("./version");
describe('range', () => {
    describe('Version', () => {
        test('simple', () => {
            const version = new version_1.Version('1.0.0');
            expect(version.isTag).toBeFalsy();
            expect(version.tag).toEqual(undefined);
            expect(version.semver).toEqual(new semver_1.SemVer('1.0.0'));
        });
        test('simple 2', () => {
            const version = new version_1.Version('2.0.0');
            expect(version.isTag).toBeFalsy();
            expect(version.tag).toEqual(undefined);
            expect(version.semver).toEqual(new semver_1.SemVer('2.0.0'));
        });
        test('tag', () => {
            const version = new version_1.Version('master');
            expect(version.isTag).toBeTruthy();
            expect(version.tag).toEqual('master');
            expect(version.semver).toEqual(undefined);
        });
        test('tag multiple characters', () => {
            const version = new version_1.Version('master/wef');
            expect(version.isTag).toBeTruthy();
            expect(version.tag).toEqual('master/wef');
            expect(version.semver).toEqual(undefined);
        });
        test('tag with semver', () => {
            const version = new version_1.Version('master/wefv1.2.3');
            expect(version.isTag).toBeFalsy();
            expect(version.tag).toEqual(undefined);
            expect(version.semver).toEqual(new semver_1.SemVer('1.2.3'));
        });
        test('tag with semver space', () => {
            const version = new version_1.Version('master/wef v1.2.3');
            expect(version.isTag).toBeFalsy();
            expect(version.tag).toEqual(undefined);
            expect(version.semver).toEqual(new semver_1.SemVer('1.2.3'));
        });
        test('undefined remains', () => {
            expect(new version_1.Version(undefined).semver).toEqual(undefined);
        });
    });
});
//# sourceMappingURL=version.spec.js.map