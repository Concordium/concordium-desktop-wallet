export function getGTUSymbol(): string {
    return '\u01E4';
}

const microGTUPerGTU = 1000000n;

// Checks that the input is a valid GTU string.
export function isValidGTU(amount: string): boolean {
    // Only allow numerals, and only allow millionth decimals (in order to keep microGTU atomic)
    const regex = /^\d+(\.\d{0,6})?$/;
    return regex.test(amount);
}

/**
 * Given a GTU string, convert to microGTU
 */
export function toMicroUnits(amount: string): BigInt {
    if (isValidGTU(amount)) {
        return BigInt(amount) * microGTUPerGTU;
    }
    throw new Error('Given string that was not a valid GTU string.');
}

/**
 * Given a microGTU amount, returns the same amount in GTU
 * in a displayable format.
 * Allows input type string, as many times we get microGTU as strings
 * from external sources.
 */
export function displayAsGTU(microGTUAmount: BigInt | string) {
    let amount = microGTUAmount;
    if (typeof microGTUAmount === 'string') {
        amount = BigInt(microGTUAmount);
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
    return `${negative} ${getGTUSymbol()} ${GTU}${microGTUFormatted}`;
}
