export function fromMicroUnits(rawAmount) {
    const amount = parseInt(rawAmount, 10);
    const absolute = Math.abs(amount);
    const GTU = Math.floor(absolute / 1000000);
    const microGTU = (absolute % 1000000).toString();
    const leadingZeroes = '0'.repeat(6 - microGTU.length);
    const negative = amount < 0 ? '-' : '';
    return `${negative} G ${GTU}.${leadingZeroes}${microGTU}`;
}
