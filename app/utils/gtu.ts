export function getGTUSymbol(): string {
    return '\u01E4';
}

const microGTUPerGTU = 1000000n;
const separator = '.';
const gtuFormat = new RegExp('^(0|[1-9]\\d*)(\\.\\d{1,6})?$');

// Checks that the input is a valid GTU string.
export function isValidGTUString(amount: string): boolean {
    // Only allow numerals, and only allow millionth decimals (in order to keep microGTU atomic)
    return gtuFormat.test(amount);
}

/**
 * expects the fractional part of the a GTU string.
 * i.e. from an amount of 10.001, the subGTU string is 001.
 */
function parseSubGTU(subGTU: string) {
    let result = subGTU;
    result += '0'.repeat(6 - subGTU.toString().length);
    return result;
}

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
    let amount: bigint;
    if (typeof microGTUAmount === 'string') {
        try {
            amount = BigInt(microGTUAmount);
        } catch (e) {
            throw new Error(
                'Given string that was not a valid microGTU string.'
            );
        }
    } else {
        amount = microGTUAmount;
    }
    const isNegative = amount < 0;
    const absolute = isNegative ? -amount : amount;
    const GTU = absolute / microGTUPerGTU;
    const microGTU = absolute % microGTUPerGTU;
    const microGTUFormatted =
        microGTU === 0n
            ? ''
            : `.${'0'.repeat(
                  6 - microGTU.toString().length
              )}${microGTU.toString().replace(/0+$/, '')}`;

    const negative = isNegative ? '-' : '';
    return `${negative}${getGTUSymbol()}${GTU}${microGTUFormatted}`;
}
