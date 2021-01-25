export function getGTUSymbol() {
    return '\u01E4';
}

/**
 * Given a GTU amount, convert to microGTU
 */
export function toMicroUnits(amount: number): number {
    return Math.floor(amount * 1000000);
}

/**
 * Given a microGTU amount, returns the same amount in GTU
 * in a displayable format.
 */
export function fromMicroUnits(rawAmount) {
    const amount = parseInt(rawAmount, 10);
    const absolute = Math.abs(amount);
    const GTU = Math.floor(absolute / 1000000);
    const microGTU = absolute % 1000000;
    const microGTUFormatted =
        microGTU === 0
        ? ''
        : `.${'0'.repeat(
6 - microGTU.toString().length
)}${microGTU.toString().replace(/0+$/, '')}`;

    const negative = amount < 0 ? '-' : '';
    return `${negative} ${getGTUSymbol()} ${GTU}${microGTUFormatted}`;
}
