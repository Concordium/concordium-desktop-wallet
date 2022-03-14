import {
    isValidCcdString,
    ccdToMicroCcd,
    displayAsCcd,
    getCcdSymbol,
} from '~/utils/ccd';

const micro = BigInt(1000000);

test('A string with a non-digit is invalid CCD input', () => {
    expect(isValidCcdString('ANonCCDString')).toBe(false);
});

test('A string with only digits is valid CCD input', () => {
    expect(isValidCcdString('2135731033157134')).toBe(true);
});

test('A separator alone is invalid CCD input', () => {
    expect(isValidCcdString('.')).toBe(false);
});

test('A leading separator is invalid CCD input', () => {
    expect(isValidCcdString('.5')).toBe(false);
});

test('A string pre-fixed with a 0 without a following separator is invalid CCD input', () => {
    expect(isValidCcdString('01')).toBe(false);
});

test('A string pre-fixed with multiple 0s with a separator is invalid CCD input', () => {
    expect(isValidCcdString('00.1')).toBe(false);
});

test('A string pre-fixed with a 0 followed by a separator is valid CCD input', () => {
    expect(isValidCcdString('0.123456')).toBe(true);
});

test('A string with more than 6 digits after the separator is invalid CCD input', () => {
    expect(isValidCcdString('10.1234567')).toBe(false);
});

test('An empty string is not allowed', () => {
    expect(isValidCcdString('')).toBe(false);
});

test("Doesn't allow exponent", () => {
    expect(isValidCcdString('10e2')).toBe(false);
});

test('Undefined is not allowed', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(isValidCcdString(undefined as any)).toBe(false);
});

test('Whole number CCD string is converted to µCCD correctly', () => {
    expect(ccdToMicroCcd('11')).toBe(BigInt(BigInt(11) * micro));
});

test('Fractional CCD string is converted to µCCD correctly', () => {
    expect(ccdToMicroCcd('0.5317')).toBe(BigInt(BigInt(531700)));
});

test('Invalid CCD string throws exception', () => {
    expect(() => {
        ccdToMicroCcd('InvalidInput');
    }).toThrow();
});

test('A non-fractional µCCD amount is displayed correctly', () => {
    expect(displayAsCcd(BigInt(1000000))).toBe(`${getCcdSymbol()}1.00`);
});

test('A fractional µCCD amount is displayed correctly', () => {
    expect(displayAsCcd(BigInt(450000))).toBe(`${getCcdSymbol()}0.45`);
});

test('A zero µCCD amount is displayed correctly', () => {
    expect(displayAsCcd(BigInt(0))).toBe(`${getCcdSymbol()}0.00`);
});

test('A non-fractional µCCD string is displayed correctly', () => {
    expect(displayAsCcd('1000000')).toBe(`${getCcdSymbol()}1.00`);
    expect(displayAsCcd('1000000000')).toBe(`${getCcdSymbol()}1,000.00`);
    expect(displayAsCcd('1000000000000')).toBe(`${getCcdSymbol()}1,000,000.00`);
});

test('A fractional µCCD string is displayed correctly', () => {
    expect(displayAsCcd('450000')).toBe(`${getCcdSymbol()}0.45`);
    expect(displayAsCcd('1234450000')).toBe(`${getCcdSymbol()}1,234.45`);
});

test('A zero µCCD string is displayed correctly', () => {
    expect(displayAsCcd('0')).toBe(`${getCcdSymbol()}0.00`);
});

test('a fractional CCD string throws exception', () => {
    expect(() => {
        displayAsCcd('1.04');
    }).toThrow();
});

test('a non numeric string throws exception', () => {
    expect(() => {
        displayAsCcd('invalidInput');
    }).toThrow();
});
