const numberSeparator = '.';
const pow10Format = /^1(0*)$/;

export const isValidBigInt = (value: string): boolean => {
    try {
        BigInt(value);
        return true;
    } catch {
        return false;
    }
};

function toBigInt(input: bigint | string): bigint {
    if (typeof input === 'string' || typeof input === 'number') {
        return BigInt(input);
    }
    return input;
}

function getPowerOf10(resolution: bigint): number {
    return resolution
        .toString()
        .split('')
        .filter((c) => c === '0').length;
}

/**
 * @description
 * Tests whether or not given resolution is a power of 10.
 *
 * @param resolution power of 10 resolution (1, 10, 100, etc.)
 *
 * @example
 * isPowerOf10(10) => true
 * isPowerOf10(105) => false
 */
export function isPowOf10(resolution: bigint): boolean {
    return pow10Format.test(resolution.toString());
}

const isValidNumberString = (allowNegative = false, allowedDigits?: number) => {
    let re: RegExp;

    if (allowedDigits === undefined) {
        re = new RegExp(
            `^${allowNegative ? '(-)?' : ''}(0|[1-9]\\d*)(\\.\\d*)?$`
        );
    } else if (allowedDigits === 0) {
        re = new RegExp(`^${allowNegative ? '(-)?' : ''}(0|[1-9]\\d*)$`);
    } else {
        re = new RegExp(
            `^${
                allowNegative ? '(-)?' : ''
            }(0|[1-9]\\d*)(\\.\\d{1,${allowedDigits}})?$`
        );
    }

    return (value: string): boolean => {
        // Only allow numerals, and only allow decimals according to resolution.
        return re.test(value);
    };
};

export const isValidResolutionString = (
    resolution: bigint,
    allowNegative = false
) => isValidNumberString(allowNegative, getPowerOf10(resolution));

const withValidResolution = <TReturn>(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    f: (resolution: bigint) => TReturn
): typeof f => {
    return (resolution: bigint) => {
        if (!isPowOf10(resolution)) {
            throw new Error('Resolution must be a power of 10');
        }

        return f(resolution);
    };
};

/**
 * @description converts integer to number string represented as fraction.
 *
 * @throws If resolution x is anything but a power of 10 (1, 10, 100, 1000, etc.)
 *
 * @example toNumberString(100n)(10n) => '0.1'
 */
export const toFraction = withValidResolution((resolution: bigint) => {
    const zeros = getPowerOf10(resolution);

    return (value?: bigint | string): string | undefined => {
        if (value === undefined) {
            return undefined;
        }

        const numberValue: bigint = toBigInt(value);
        const isNegative = numberValue < 0;
        const absolute = isNegative ? -numberValue : numberValue;
        const whole = absolute / resolution;

        const fractions = absolute % resolution;
        const fractionsFormatted =
            fractions === 0n
                ? ''
                : `.${'0'.repeat(
                      zeros - fractions.toString().length
                  )}${fractions.toString().replace(/0+$/, '')}`;
        return `${isNegative ? '-' : ''}${whole}${fractionsFormatted}`;
    };
});

/**
 * expects the fractional part of the a fraction number string.
 * i.e. from an amount of 10.001, the fraction number string is 001.
 */
export const parseSubNumber = (powOf10: number) => (
    fraction: string
): string => {
    let result = fraction;
    result += '0'.repeat(Math.max(0, powOf10 - fraction.toString().length));
    return result;
};

/**
 * @description converts fraction string to bigint by multiplying with resolution.
 *
 * @throws If resolution x is anything but a power of 10 (1, 10, 100, 1000, etc.)
 *
 * @example toResolution(100n)('0.1') => 10n
 */
export const toResolution = withValidResolution((resolution: bigint) => {
    const isValid = isValidResolutionString(resolution);
    const parseFraction = parseSubNumber(getPowerOf10(resolution));

    return (value?: string): bigint | undefined => {
        if (value === undefined) {
            return undefined;
        }

        if (!isValid(value)) {
            throw new Error(
                `Given string cannot be parsed to resolution: ${resolution}`
            );
        }

        if (!value.includes(numberSeparator)) {
            return BigInt(value) * resolution;
        }

        const separatorIndex = value.indexOf(numberSeparator);
        const whole = value.slice(0, separatorIndex);
        const fractions = parseFraction(value.slice(separatorIndex + 1));
        return BigInt(whole) * resolution + BigInt(fractions);
    };
});

const replaceCharAt = (
    value: string,
    index: number,
    replacement: string
): string =>
    value.substr(0, index) +
    replacement +
    value.substr(index + replacement.length);

function increment(value: string, allowOverflow = true): string {
    const negative = value.charAt(0) === '-';
    let valueInc = value;
    const lastIndex = negative ? 1 : 0;

    // Round up - increment chars from right to left while char incremented hits lastIndex.
    // eslint-disable-next-line no-plusplus
    for (let i = valueInc.length - 1; i >= lastIndex; i--) {
        const char = valueInc.charAt(i);
        const parsed = parseInt(char, 10);
        const overflows = parsed === 9;
        const replacement =
            !overflows || (allowOverflow && i === lastIndex) ? parsed + 1 : 0;

        valueInc = replaceCharAt(valueInc, i, replacement.toString());
        if (!overflows) {
            return valueInc;
        }
    }

    return valueInc;
}

const formatRounded = (isInt: boolean) => (whole: string, fractions: string) =>
    `${whole}${isInt ? '' : `.${fractions}`}`;

/**
 * @description
 * Rounds number strings to nearest value with n fraction digits.
 *
 * @param digits digits to round to. f.x. 3 gives 1.2345 => 1.235
 */
export const round = (digits = 0) => (value: string): string => {
    const format = formatRounded(digits === 0);
    const [whole, fractions = ''] = value.split('.');

    if (fractions.length <= digits) {
        // If less fractions than digits to round to, do nothing.
        return value;
    }

    let roundedFractions = fractions.substr(0, digits);
    const overflow = fractions.substr(digits);

    const upperBound = BigInt(
        `1${new Array(overflow.length).fill('0').join('')}`
    );

    const nOverflow = BigInt(overflow);
    if (upperBound - nOverflow > nOverflow) {
        // Round down - simply remove overflowing digits.
        return format(whole, roundedFractions);
    }

    const wholeInc = increment(whole);
    if (digits !== 0) {
        roundedFractions = increment(roundedFractions, false);

        if (parseInt(roundedFractions, 10) !== 0 && digits) {
            return format(whole, roundedFractions);
        }
    }

    return format(wholeInc, roundedFractions);
};

/**
 * @description
 * Works like Number.toFixed.
 *
 * @example
 * const ensureTwoDigits = toFixed(2);
 *
 * ensureTwoDigits('1.2') => '1.20'
 * ensureTwoDigits('1.223') => '1.22'
 */
export const toFixed = (digits: number) => (value: string): string => {
    const [whole, fractions = ''] = value.split('.');

    if (fractions.length <= digits) {
        const missingDigits = digits - fractions.length;
        const danglingZeros = new Array(missingDigits).fill('0').join('');

        return `${whole}.${fractions ?? ''}${danglingZeros}`;
    }

    return round(digits)(value);
};

/**
 * @description
 * Formats number strings according to specified fraction digit rules.
 *
 * @param minFractionDigits min fraction digits in formatted result
 * @param maxFractionDigits max fraction digits in formatted result. Must be below min fraction digits
 *
 * @throws If given invalid value (e.g. non-number string)
 * @throws If max fraction digits < min fraction digits.
 *
 * @example
 * const formatNumber = formatNumberStringWithDigits(2, 5);
 *
 * formatNumber('1') => '1.00'
 * formatNumber('1.234') => '1.234'
 * formatNumber('1.23456789') => '1.23457'
 */
export const formatNumberStringWithDigits = (
    minFractionDigits: number,
    maxFractionDigits?: number
) => {
    if (
        typeof maxFractionDigits === 'number' &&
        maxFractionDigits < minFractionDigits
    ) {
        throw new Error(
            `Tried to ensure more digits (${minFractionDigits}) that allowed by allowFractions (${maxFractionDigits})`
        );
    }

    const isValid = isValidNumberString(true);

    return (value = ''): string => {
        if (!isValid(value)) {
            throw new Error(
                "Tried to format a string that doesn't represent a number"
            );
        }
        if (value === '') {
            return value;
        }

        const [, fractions] = value.split('.');
        const valueFractionDigits = fractions?.length ?? 0;

        if (valueFractionDigits === 0 && minFractionDigits === 0) {
            return value;
        }

        const digits =
            maxFractionDigits === undefined
                ? Math.max(valueFractionDigits, minFractionDigits)
                : Math.max(
                      minFractionDigits,
                      Math.min(maxFractionDigits, valueFractionDigits)
                  );

        return toFixed(digits)(value);
    };
};
