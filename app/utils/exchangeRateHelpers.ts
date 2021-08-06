import { ExchangeRate } from '@concordium/node-sdk';

const getGCD = (a: bigint, b: bigint): bigint => (b ? getGCD(b, a % b) : a);

/**
 * @description
 * Reduces fraction of 2 bigints
 *
 * @returns tuple of reduced numerator & denominator.
 *
 * @example
 * reduceExchangeRate(2n, 4n) => [1n, 2n]
 */
export function reduceFraction(
    numerator: bigint,
    denominator: bigint
): [bigint, bigint] {
    const gcd = getGCD(numerator, denominator);
    return [numerator / gcd, denominator / gcd];
}

export const getReducedExchangeRate = ({
    numerator,
    denominator,
}: ExchangeRate): ExchangeRate => {
    const [rn, rd] = reduceFraction(numerator, denominator);
    return { numerator: rn, denominator: rd };
};
