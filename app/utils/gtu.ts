import {
    getPowerOf10,
    formatNumberStringWithDigits,
    isValidResolutionString,
    parseSubNumber,
    toFraction,
    addThousandSeparators,
} from './numberStringHelpers';

export function getGTUSymbol(): string {
    return '\u03FE';
}

export const microGTUPerGTU = 1000000n;
const separator = '.';

/**
 * Given an ambigous input, convert it into a bigint.
 * N.B. In case the input is a string, it is assumed that it represents the value in microCCD.
 */
function toBigInt(input: bigint | string): bigint {
    if (typeof input === 'string') {
        try {
            return BigInt(input);
        } catch (e) {
            throw new Error(
                'Given string that was not a valid microCCD string.'
            );
        }
    }
    return input;
}

// Checks that the input is a valid CCD string.
export const isValidGTUString = isValidResolutionString(
    microGTUPerGTU,
    false,
    false,
    false
);

/**
 * expects the fractional part of the a CCD string.
 * i.e. from an amount of 10.001, the subCCD string is 001.
 */
const parseSubGTU = parseSubNumber(getPowerOf10(microGTUPerGTU));

/**
 * Convert a microCCD amount to a gtu string.
 * Should be used for user interaction.
 * N.B. Gives the absolute value of the amount.
 * N.B. In case the input is a string, it is assumed that it represents the value in microCCD.
 */
export const microGtuToGtu = toFraction(microGTUPerGTU);

/**
 * Given a CCD string, convert to microCCD
 */
export function toMicroUnits(amount: string): bigint {
    if (!isValidGTUString(amount)) {
        throw new Error('Given string that was not a valid CCD string.');
    }
    if (amount.includes(separator)) {
        const separatorIndex = amount.indexOf(separator);
        const gtu = amount.slice(0, separatorIndex);
        const microGTU = parseSubGTU(amount.slice(separatorIndex + 1));
        return BigInt(gtu) * microGTUPerGTU + BigInt(microGTU);
    }
    return BigInt(amount) * microGTUPerGTU;
}

const formatGtuString = formatNumberStringWithDigits(2);

/**
 * Given a microCCD amount, returns the same amount in CCD
 * in a displayable format.
 * Allows input type string, because microCCD from external sources are strings.
 * N.B. In case the input is a string, it is assumed that it represents the value in microCCD.
 */
export function displayAsGTU(microGTUAmount: bigint | string) {
    const amount: bigint = toBigInt(microGTUAmount);
    const negative = amount < 0n ? '-' : '';
    const abs = amount < 0n ? -amount : amount;
    const formatted = addThousandSeparators(
        formatGtuString(microGtuToGtu(abs))
    );
    return `${negative}${getGTUSymbol()}${formatted}`;
}
