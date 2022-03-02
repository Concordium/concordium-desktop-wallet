import {
    getPowerOf10,
    formatNumberStringWithDigits,
    isValidResolutionString,
    parseSubNumber,
    toFraction,
    addThousandSeparators,
} from '~/utils/numberStringHelpers';

export function getCCDSymbol(): string {
    return '\u03FE';
}

export const microCCDPerCCD = 1000000n;
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
export const isValidCCDString = isValidResolutionString(
    microCCDPerCCD,
    false,
    false,
    false
);

/**
 * expects the fractional part of the a CCD string.
 * i.e. from an amount of 10.001, the subCCD string is 001.
 */
const parseSubCCD = parseSubNumber(getPowerOf10(microCCDPerCCD));

/**
 * Convert a microCCD amount to a ccd string.
 * Should be used for user interaction.
 * N.B. Gives the absolute value of the amount.
 * N.B. In case the input is a string, it is assumed that it represents the value in microCCD.
 */
export const microCCDToCCD = toFraction(microCCDPerCCD);

/**
 * Given a CCD string, convert to microCCD
 */
export function toMicroUnits(amount: string): bigint {
    if (!isValidCCDString(amount)) {
        throw new Error('Given string that was not a valid CCD string.');
    }
    if (amount.includes(separator)) {
        const separatorIndex = amount.indexOf(separator);
        const ccd = amount.slice(0, separatorIndex);
        const microCCD = parseSubCCD(amount.slice(separatorIndex + 1));
        return BigInt(ccd) * microCCDPerCCD + BigInt(microCCD);
    }
    return BigInt(amount) * microCCDPerCCD;
}

export const formatCCDString = formatNumberStringWithDigits(2);

/**
 * Given a microCCD amount, returns the same amount in CCD
 * in a displayable format.
 * Allows input type string, because microCCD from external sources are strings.
 * N.B. In case the input is a string, it is assumed that it represents the value in microCCD.
 */
export function displayAsCCD(microCCDAmount: bigint | string) {
    const amount: bigint = toBigInt(microCCDAmount);
    const negative = amount < 0n ? '-' : '';
    const abs = amount < 0n ? -amount : amount;
    const formatted = addThousandSeparators(
        formatCCDString(microCCDToCCD(abs))
    );
    return `${negative}${getCCDSymbol()}${formatted}`;
}
