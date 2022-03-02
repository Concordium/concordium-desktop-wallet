import {
    isValidCCDString,
    toMicroUnits,
    displayAsCCD,
    getCCDSymbol,
} from '~/utils/ccd';

const micro = BigInt(1000000);

test('A string with a non-digit is invalid CCD input', () => {
    expect(isValidCCDString('ANonCCDString')).toBe(false);
});

test('A string with only digits is valid CCD input', () => {
    expect(isValidCCDString('2135731033157134')).toBe(true);
});

test('A separator alone is invalid CCD input', () => {
    expect(isValidCCDString('.')).toBe(false);
});

test('A leading separator is invalid CCD input', () => {
    expect(isValidCCDString('.5')).toBe(false);
});

test('A string pre-fixed with a 0 without a following separator is invalid CCD input', () => {
    expect(isValidCCDString('01')).toBe(false);
});

test('A string pre-fixed with multiple 0s with a separator is invalid CCD input', () => {
    expect(isValidCCDString('00.1')).toBe(false);
});

test('A string pre-fixed with a 0 followed by a separator is valid CCD input', () => {
    expect(isValidCCDString('0.123456')).toBe(true);
});

test('A string with more than 6 digits after the separator is invalid CCD input', () => {
    expect(isValidCCDString('10.1234567')).toBe(false);
});

test('An empty string is not allowed', () => {
    expect(isValidCCDString('')).toBe(false);
});

test("Doesn't allow exponent", () => {
    expect(isValidCCDString('10e2')).toBe(false);
});

test('Undefined is not allowed', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(isValidCCDString(undefined as any)).toBe(false);
});

test('Whole number CCD string is converted to µCCD correctly', () => {
    expect(toMicroUnits('11')).toBe(BigInt(BigInt(11) * micro));
});

test('Fractional CCD string is converted to µCCD correctly', () => {
    expect(toMicroUnits('0.5317')).toBe(BigInt(BigInt(531700)));
});

test('Invalid CCD string throws exception', () => {
    expect(() => {
        toMicroUnits('InvalidInput');
    }).toThrow();
});

test('A non-fractional µCCD amount is displayed correctly', () => {
    expect(displayAsCCD(BigInt(1000000))).toBe(`${getCCDSymbol()}1.00`);
});

test('A fractional µCCD amount is displayed correctly', () => {
    expect(displayAsCCD(BigInt(450000))).toBe(`${getCCDSymbol()}0.45`);
});

test('A zero µCCD amount is displayed correctly', () => {
    expect(displayAsCCD(BigInt(0))).toBe(`${getCCDSymbol()}0.00`);
});

test('A non-fractional µCCD string is displayed correctly', () => {
    expect(displayAsCCD('1000000')).toBe(`${getCCDSymbol()}1.00`);
    expect(displayAsCCD('1000000000')).toBe(`${getCCDSymbol()}1,000.00`);
    expect(displayAsCCD('1000000000000')).toBe(`${getCCDSymbol()}1,000,000.00`);
});

test('A fractional µCCD string is displayed correctly', () => {
    expect(displayAsCCD('450000')).toBe(`${getCCDSymbol()}0.45`);
    expect(displayAsCCD('1234450000')).toBe(`${getCCDSymbol()}1,234.45`);
});

test('A zero µCCD string is displayed correctly', () => {
    expect(displayAsCCD('0')).toBe(`${getCCDSymbol()}0.00`);
});

test('a fractional CCD string throws exception', () => {
    expect(() => {
        displayAsCCD('1.04');
    }).toThrow();
});

test('a non numeric string throws exception', () => {
    expect(() => {
        displayAsCCD('invalidInput');
    }).toThrow();
});
