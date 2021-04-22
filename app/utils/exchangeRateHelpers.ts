const getGCD = (a: bigint, b: bigint): bigint => (b ? getGCD(b, a % b) : a);

// eslint-disable-next-line import/prefer-default-export
export function reduceExchangeRate(
    numerator: bigint,
    denominator: bigint
): [bigint, bigint] {
    const gcd = getGCD(numerator, denominator);
    return [numerator / gcd, denominator / gcd];
}
