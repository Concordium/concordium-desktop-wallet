const numberSeparator = '.';
const pow10Format = /^1(0*)$/;

function toBigInt(input: bigint | string): bigint {
    if (typeof input === 'string') {
        try {
            return BigInt(input);
        } catch (e) {
            throw new Error(
                'Given string that was not a valid microGTU string.'
            );
        }
    }
    return input;
}

function getZeros(resolution: bigint): number {
    return resolution
        .toString()
        .split('')
        .filter((c) => c !== '0').length;
}

function isPowOf10(resolution: bigint): boolean {
    return pow10Format.test(resolution.toString());
}

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
export const toNumberString = withValidResolution(
    (resolution: bigint) => (amount?: bigint | string): string | undefined => {
        if (amount === undefined) {
            return undefined;
        }

        const numberAmount: bigint = toBigInt(amount);
        const absolute = numberAmount < 0 ? -numberAmount : numberAmount;
        const whole = absolute / resolution;

        const fractions = absolute % resolution;
        const microGTUFormatted =
            fractions === 0n
                ? ''
                : `.${'0'.repeat(
                      getZeros(resolution) - fractions.toString().length
                  )}${fractions.toString().replace(/0+$/, '')}`;
        return `${whole}${microGTUFormatted}`;
    }
);

const parseSubNumber = (powOf10: number, subGTU: string): string => {
    let result = subGTU;
    result += '0'.repeat(powOf10 - subGTU.toString().length);
    return result;
};

/**
 * @description converts fraction string to bigint by multiplying with resolution.
 *
 * @throws If resolution x is anything but a power of 10 (1, 10, 100, 1000, etc.)
 *
 * @example toResolution(100n)('0.1') => 10n
 */
export const toResolution = withValidResolution(
    (resolution: bigint) => (amount?: string): bigint | undefined => {
        if (amount === undefined) {
            return undefined;
        }

        if (!amount.includes(numberSeparator)) {
            return BigInt(amount) * resolution;
        }

        const separatorIndex = amount.indexOf(numberSeparator);
        const whole = amount.slice(0, separatorIndex);
        const fractions = parseSubNumber(
            getZeros(resolution),
            amount.slice(separatorIndex + 1)
        );
        return BigInt(whole) * resolution + BigInt(fractions);
    }
);
