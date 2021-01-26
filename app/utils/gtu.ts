export function getGTUSymbol() {
    return '\u01E4';
}

// Checks that the input is a number and that it does not split micro units
export function isValidGTU(amount) {
    return !Number.isNaN(amount) && Number.isInteger(amount * 1000000);
}

/**
 * Given a GTU amount, convert to microGTU
 */
export function toMicroUnits(amount: BigInt): BigInt {
    return amount * 1000000n;
}

/**
 * Given a microGTU amount, returns the same amount in GTU
 * in a displayable format.
 */
export function fromMicroUnits(rawAmount) {
    const amount = BigInt(rawAmount);
    const absolute = amount < 0 ? -amount : amount;
    const GTU = absolute / 1000000n;
    const microGTU = absolute % 1000000n;
    const microGTUFormatted =
        microGTU === 0n
            ? ''
            : `.${'0'.repeat(
                  6 - microGTU.toString().length
              )}${microGTU.toString().replace(/0+$/, '')}`;

    const negative = amount < 0 ? '-' : '';
    return `${negative} ${getGTUSymbol()} ${GTU}${microGTUFormatted}`;
}
