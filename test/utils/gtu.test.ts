import {
    isValidGTU,
    toMicroUnits,
    displayAsGTU,
    getGTUSymbol,
} from '../../app/utils/gtu';

const micro = BigInt(1000000);

test('A string with a non-digit is invalid GTU input', () => {
    expect(isValidGTU('ANonGTUString')).toBe(false);
});

test('A string with only digits is valid GTU input', () => {
    expect(isValidGTU('2135731033157134')).toBe(true);
});

test('A string pre-fixed with a 0 without a following separator is invalid GTU input', () => {
    expect(isValidGTU('01')).toBe(false);
});

test('A string pre-fixed with multiple 0s with a separator is invalid GTU input', () => {
    expect(isValidGTU('00.1')).toBe(false);
});

test('A string pre-fixed with a 0 followed by a separator is valid GTU input', () => {
    expect(isValidGTU('0.123456')).toBe(true);
});

test('A string with more than 6 digits after the separator is invalid GTU input', () => {
    expect(isValidGTU('10.1234567')).toBe(false);
});

test('Whole number GTU string is converted to µGTU correctly', () => {
    expect(toMicroUnits('11')).toBe(BigInt(BigInt(11) * micro));
});

test('Fractional GTU string is converted to µGTU correctly', () => {
    expect(toMicroUnits('0.5317')).toBe(BigInt(BigInt(531700)));
});

test('Invalid GTU string throws exception', () => {
    expect(() => {
        toMicroUnits('InvalidInput');
    }).toThrow();
});

test('A non-fractional µGTU amount is displayed correctly', () => {
    expect(displayAsGTU(BigInt(1000000))).toBe(`${getGTUSymbol()}1`);
});

test('A fractional µGTU amount is displayed correctly', () => {
    expect(displayAsGTU(BigInt(450000))).toBe(`${getGTUSymbol()}0.45`);
});

test('A zero µGTU amount is displayed correctly', () => {
    expect(displayAsGTU(BigInt(0))).toBe(`${getGTUSymbol()}0`);
});
