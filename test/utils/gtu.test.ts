import {
    isValidGTUString,
    toMicroUnits,
    displayAsGTU,
    getGTUSymbol,
} from '../../app/utils/gtu';

const micro = BigInt(1000000);

test('A string with a non-digit is invalid GTU input', () => {
    expect(isValidGTUString('ANonGTUString')).toBe(false);
});

test('A string with only digits is valid GTU input', () => {
    expect(isValidGTUString('2135731033157134')).toBe(true);
});

test('A separator alone is invalid GTU input', () => {
    expect(isValidGTUString('.')).toBe(false);
});

test('A leading separator is invalid GTU input', () => {
    expect(isValidGTUString('.5')).toBe(false);
});

test('A string pre-fixed with a 0 without a following separator is invalid GTU input', () => {
    expect(isValidGTUString('01')).toBe(false);
});

test('A string pre-fixed with multiple 0s with a separator is invalid GTU input', () => {
    expect(isValidGTUString('00.1')).toBe(false);
});

test('A string pre-fixed with a 0 followed by a separator is valid GTU input', () => {
    expect(isValidGTUString('0.123456')).toBe(true);
});

test('A string with more than 6 digits after the separator is invalid GTU input', () => {
    expect(isValidGTUString('10.1234567')).toBe(false);
});

test('An empty string is not allowed', () => {
    expect(isValidGTUString('')).toBe(false);
});

test('Undefined is not allowed', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(isValidGTUString(undefined as any)).toBe(false);
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

test('A non-fractional µGTU string is displayed correctly', () => {
    expect(displayAsGTU('1000000')).toBe(`${getGTUSymbol()}1`);
});

test('A fractional µGTU string is displayed correctly', () => {
    expect(displayAsGTU('450000')).toBe(`${getGTUSymbol()}0.45`);
});

test('A zero µGTU string is displayed correctly', () => {
    expect(displayAsGTU('0')).toBe(`${getGTUSymbol()}0`);
});

test('a fractional GTU string throws exception', () => {
    expect(() => {
        displayAsGTU('1.04');
    }).toThrow();
});

test('a non numeric string throws exception', () => {
    expect(() => {
        displayAsGTU('invalidInput');
    }).toThrow();
});
