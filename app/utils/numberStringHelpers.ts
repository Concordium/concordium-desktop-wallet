const numberSeparator = '.';
const pow10Format = /^1(0*)$/;

function toBigInt(input: bigint | string): bigint {
    if (typeof input === 'string') {
        return BigInt(input);
    }
    return input;
}

function getZeros(resolution: bigint): number {
    return resolution
        .toString()
        .split('')
        .filter((c) => c === '0').length;
}

export function isPowOf10(resolution: bigint): boolean {
    return pow10Format.test(resolution.toString());
}

export const isValidResolutionString = (
    resolution: bigint,
    allowNegative = false
) => {
    const zeros = getZeros(resolution);

    let re: RegExp;

    if (zeros === 0) {
        re = new RegExp(`^${allowNegative ? '(-)?' : ''}\\d*$`);
    } else {
        re = new RegExp(
            `^${allowNegative ? '(-)?' : ''}(0|[1-9]\\d*)(\\.\\d{1,${getZeros(
                resolution
            )}})?$`
        );
    }

    return (value: string): boolean => {
        // Only allow numerals, and only allow decimals according to resolution (in order to keep microGTU atomic)
        return re.test(value);
    };
};

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
export const toNumberString = withValidResolution((resolution: bigint) => {
    const zeros = getZeros(resolution);

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
    const parseFraction = parseSubNumber(getZeros(resolution));

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

function increment(value: string): string {
    let valueInc = value;

    // Round up - increment chars from right to left while char incremented hits 0.
    // eslint-disable-next-line no-plusplus
    for (let i = valueInc.length - 1; i > 0; i--) {
        const char = valueInc.charAt(i);
        const parsed = parseInt(char, 10);

        valueInc = replaceCharAt(valueInc, i, (parsed + 1).toString());

        if (parsed !== 9) {
            return valueInc;
        }
    }

    return valueInc;
}

export const round = (digits = 0) => (value: string): string => {
    const [whole, fractions = ''] = value.split('.');

    if (fractions.length <= digits) {
        // If less fractions than digits to round to, do nothing.
        return value;
    }

    let roundedFractions = fractions.substr(0, digits);
    const overflow = fractions.substr(digits + 1);

    const upperBound = BigInt(`1${overflow.replaceAll(/\d/g, '0')}`);

    const nOverflow = BigInt(overflow);
    if (upperBound - nOverflow > nOverflow) {
        // Round down - simply remove overflowing digits.
        return `${whole}.${roundedFractions}`;
    }

    roundedFractions = increment(roundedFractions);
    if (parseInt(roundedFractions, 10) !== 0) {
        return `${whole}.${roundedFractions}`;
    }

    const wholeInc = increment(whole);
    if (parseInt(wholeInc, 10) !== 0) {
        return `${wholeInc}.${roundedFractions}`;
    }

    return `1${wholeInc}.${roundedFractions}`;
};

export const toFixed = (digits: number) => (value: string): string => {
    const [whole, fractions = ''] = value.split('.');

    if (fractions.length <= digits) {
        const missingDigits = digits - fractions.length;
        const danglingZeros = new Array(missingDigits).fill('0').join('');

        return `${whole}.${fractions ?? ''}${danglingZeros}`;
    }

    return round(digits)(value);
};

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

    return (value = ''): string => {
        if (value === '') {
            return value;
        }

        const [, fractions] = value.split('.');
        const valueFractionDigits = fractions?.length ?? 0;

        if (maxFractionDigits === undefined) {
            return toFixed(Math.max(valueFractionDigits, minFractionDigits))(
                value
            );
        }

        return toFixed(
            Math.max(
                minFractionDigits,
                Math.min(maxFractionDigits, valueFractionDigits)
            )
        )(value);
    };
};
