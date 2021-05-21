import {
    getPowerOf10,
    isValidResolutionString,
    parseSubNumber,
    toFraction,
} from './numberStringHelpers';

export function getGTUSymbol(): string {
    return '\u01E4';
}

export const microGTUPerGTU = 1000000n;
const separator = '.';

/**
 * Given an ambigous input, convert it into a bigint.
 * N.B. In case the input is a string, it is assumed that it represents the value in microGTU.
 */
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

// Checks that the input is a valid GTU string.
export const isValidGTUString = isValidResolutionString(
    microGTUPerGTU,
    false,
    false
);

/**
 * expects the fractional part of the a GTU string.
 * i.e. from an amount of 10.001, the subGTU string is 001.
 */
const parseSubGTU = parseSubNumber(getPowerOf10(microGTUPerGTU));

/**
 * Convert a microGTU amount to a gtu string.
 * Should be used for user interaction.
 * N.B. Gives the absolute value of the amount.
 * N.B. In case the input is a string, it is assumed that it represents the value in microGTU.
 */
export const toGTUString = toFraction(microGTUPerGTU);

/**
 * Given a GTU string, convert to microGTU
 */
export function toMicroUnits(amount: string): bigint {
    if (!isValidGTUString(amount)) {
        throw new Error('Given string that was not a valid GTU string.');
    }
    if (amount.includes(separator)) {
        const separatorIndex = amount.indexOf(separator);
        const gtu = amount.slice(0, separatorIndex);
        const microGTU = parseSubGTU(amount.slice(separatorIndex + 1));
        return BigInt(gtu) * microGTUPerGTU + BigInt(microGTU);
    }
    return BigInt(amount) * microGTUPerGTU;
}

/**
 * Given a microGTU amount, returns the same amount in GTU
 * in a displayable format.
 * Allows input type string, because microGTU from external sources are strings.
 * N.B. In case the input is a string, it is assumed that it represents the value in microGTU.
 */
export function displayAsGTU(microGTUAmount: bigint | string) {
    const amount: bigint = toBigInt(microGTUAmount);
    const negative = amount < 0n ? '-' : '';
    const abs = amount < 0n ? -amount : amount;
    return `${negative}${getGTUSymbol()}${toGTUString(abs)}`;
}
