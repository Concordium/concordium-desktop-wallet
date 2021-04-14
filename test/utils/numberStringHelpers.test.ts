import {
    isPowOf10,
    isValidResolutionString,
    toNumberString,
    toResolution,
} from '../../app/utils/numberStringHelpers';

test('1, 10, 100, 1000 should all be powers of 10', () => {
    expect(isPowOf10(1n)).toBe(true);
    expect(isPowOf10(10n)).toBe(true);
    expect(isPowOf10(100n)).toBe(true);
    expect(isPowOf10(1000n)).toBe(true);
});

test('Non "power of 10" numbers should not be valid powers of 10', () => {
    expect(isPowOf10(5n)).toBe(false);
    expect(isPowOf10(11n)).toBe(false);
    expect(isPowOf10(30n)).toBe(false);
    expect(isPowOf10(-10n)).toBe(false);
});

test('Validates correct fraction values', () => {
    expect(isValidResolutionString(1n, true)('3')).toBe(true);
    expect(isValidResolutionString(1n, true)('-6')).toBe(true);
    expect(isValidResolutionString(10n, true)('0.1')).toBe(true);
    expect(isValidResolutionString(10n, true)('-0.3')).toBe(true);
    expect(isValidResolutionString(100n, true)('0.1')).toBe(true);
    expect(isValidResolutionString(100n, true)('0.20')).toBe(true);
    expect(isValidResolutionString(100n, true)('-0.22')).toBe(true);
});

test('Invalidates invalid fraction values', () => {
    expect(isValidResolutionString(1n, true)('0.3')).toBe(false);
    expect(isValidResolutionString(10n, true)('0.12')).toBe(false);
    expect(isValidResolutionString(100n, true)('-0.100')).toBe(false);
    expect(isValidResolutionString(100n, true)('0.200')).toBe(false);
    expect(isValidResolutionString(100n, true)('0.2233')).toBe(false);
});

test('Invalidates negative values when not allowed', () => {
    const invalidateNegative100 = isValidResolutionString(100n);

    expect(invalidateNegative100('0.10')).toBe(true);
    expect(invalidateNegative100('-0.10')).toBe(false);
});

test('Throws when given non "power of 10" resolution', () => {
    expect(() => toNumberString(5n)('1')).toThrow();
    expect(() => toResolution(-10n)('1')).toThrow();
    expect(() => toNumberString(123n)('1')).toThrow();
});

test('Correctly formats numbers', () => {
    expect(toNumberString(100n)(10n)).toBe('0.1');
    expect(toNumberString(100n)('12')).toBe('0.12');
    expect(toNumberString(10n)(12n)).toBe('1.2');
    expect(toNumberString(10n)('-12')).toBe('-1.2');
    expect(toNumberString(10n)(-22n)).toBe('-2.2');
    expect(toNumberString(1n)('3')).toBe('3');
    expect(toNumberString(1n)(-22n)).toBe('-22');
});
