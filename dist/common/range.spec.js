"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const range_1 = require("./range");
describe('range', () => {
    describe('VersionRange', () => {
        test('simple', () => {
            const r1 = new range_1.VersionRange('>1.0.0');
            expect(r1.semverMatcher).toEqual('>1.0.0');
            expect(r1.tags).toEqual([]);
            expect(r1.satisfies('1.2.0')).toBeTruthy();
            expect(r1.satisfies('1.1.0')).toBeTruthy();
            expect(r1.satisfies('2.1.0')).toBeTruthy();
            expect(r1.satisfies('master')).toBeFalsy();
            expect(r1.satisfies('dev')).toBeFalsy();
        });
        test('multiple', () => {
            const r2 = new range_1.VersionRange('>1.0.0 || <2.0.0');
            expect(r2.semverMatcher).toEqual('>1.0.0 || <2.0.0');
            expect(r2.tags).toEqual([]);
            expect(r2.satisfies('1.2.0')).toBeTruthy();
            expect(r2.satisfies('1.1.0')).toBeTruthy();
            expect(r2.satisfies('2.1.0')).toBeTruthy();
            expect(r2.satisfies('master')).toBeFalsy();
            expect(r2.satisfies('dev')).toBeFalsy();
        });
        test('multiple 2', () => {
            const r2 = new range_1.VersionRange('>1.0.0 <2.0.0');
            expect(r2.semverMatcher).toEqual('>1.0.0 <2.0.0');
            expect(r2.tags).toEqual([]);
            expect(r2.satisfies('1.2.0')).toBeTruthy();
            expect(r2.satisfies('1.1.0')).toBeTruthy();
            expect(r2.satisfies('2.1.0')).toBeFalsy();
            expect(r2.satisfies('master')).toBeFalsy();
            expect(r2.satisfies('dev')).toBeFalsy();
        });
        test('tags', () => {
            const r3 = new range_1.VersionRange('>1.0.0 || >2.0.0 || master');
            expect(r3.semverMatcher).toEqual('>1.0.0 || >2.0.0');
            expect(r3.tags).toEqual(['master']);
            expect(r3.satisfies('1.2.0')).toBeTruthy();
            expect(r3.satisfies('1.1.0')).toBeTruthy();
            expect(r3.satisfies('2.1.0')).toBeTruthy();
            expect(r3.satisfies('master')).toBeTruthy();
            expect(r3.satisfies('dev')).toBeFalsy();
        });
        test('tags multiple', () => {
            const r4 = new range_1.VersionRange('>1.0.0 || >2.0.0 || master || dev');
            expect(r4.semverMatcher).toEqual('>1.0.0 || >2.0.0');
            expect(r4.tags).toEqual(['master', 'dev']);
            expect(r4.satisfies('1.2.0')).toBeTruthy();
            expect(r4.satisfies('1.1.0')).toBeTruthy();
            expect(r4.satisfies('2.1.0')).toBeTruthy();
            expect(r4.satisfies('master')).toBeTruthy();
            expect(r4.satisfies('dev')).toBeTruthy();
        });
        test('tags shuffle', () => {
            const r5 = new range_1.VersionRange('>1.0.0 || master || dev || >2.0.0');
            expect(r5.semverMatcher).toEqual('>1.0.0 || >2.0.0');
            expect(r5.tags).toEqual(['master', 'dev']);
            expect(r5.satisfies('1.2.0')).toBeTruthy();
            expect(r5.satisfies('1.1.0')).toBeTruthy();
            expect(r5.satisfies('2.1.0')).toBeTruthy();
            expect(r5.satisfies('master')).toBeTruthy();
            expect(r5.satisfies('dev')).toBeTruthy();
        });
        test('tags alphaext only', () => {
            const r6 = new range_1.VersionRange('>1.0.0 || master/wef  || dev || >2.0.0');
            expect(r6.semverMatcher).toEqual('>1.0.0 || >2.0.0');
            expect(r6.tags).toEqual(['master/wef', 'dev']);
            expect(r6.satisfies('1.2.0')).toBeTruthy();
            expect(r6.satisfies('1.1.0')).toBeTruthy();
            expect(r6.satisfies('2.1.0')).toBeTruthy();
            expect(r6.satisfies('master')).toBeFalsy();
            expect(r6.satisfies('dev')).toBeTruthy();
            expect(r6.satisfies('master/wef')).toBeTruthy();
        });
        test('tag only', () => {
            const r7 = new range_1.VersionRange('master/wef');
            expect(r7.semverMatcher).toEqual(undefined);
            expect(r7.tags).toEqual(['master/wef']);
            expect(r7.satisfies('1.2.0')).toBeFalsy();
            expect(r7.satisfies('1.1.0')).toBeFalsy();
            expect(r7.satisfies('2.1.0')).toBeFalsy();
            expect(r7.satisfies('master')).toBeFalsy();
            expect(r7.satisfies('dev')).toBeFalsy();
            expect(r7.satisfies('master/wef')).toBeTruthy();
        });
        test('tag characters', () => {
            const r7 = new range_1.VersionRange('master/-_wef');
            expect(r7.semverMatcher).toEqual(undefined);
            expect(r7.tags).toEqual(['master/-_wef']);
            expect(r7.satisfies('1.2.0')).toBeFalsy();
            expect(r7.satisfies('1.1.0')).toBeFalsy();
            expect(r7.satisfies('2.1.0')).toBeFalsy();
            expect(r7.satisfies('master')).toBeFalsy();
            expect(r7.satisfies('dev')).toBeFalsy();
            expect(r7.satisfies('master/-_wef')).toBeTruthy();
        });
        test('tag and', () => {
            const r8 = new range_1.VersionRange('master/wef dev');
            expect(r8.semverMatcher).toEqual(undefined);
            expect(r8.tags).toEqual([]);
        });
        test('invalid', () => {
            const r8 = new range_1.VersionRange('master/wef dev');
            expect(r8.semverMatcher).toEqual(undefined);
            expect(r8.tags).toEqual([]);
            expect(() => r8.satisfies('@fwef341')).toThrow();
        });
    });
});
//# sourceMappingURL=range.spec.js.map