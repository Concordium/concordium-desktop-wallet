import { ExchangeRate, Fraction } from './types';

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

export const getReducedFraction = ({
    numerator,
    denominator,
}: Fraction): Fraction => {
    const [rn, rd] = reduceFraction(numerator, denominator);
    return { numerator: rn, denominator: rd };
};

export const getReducedExchangeRate: (
    er: ExchangeRate
) => ExchangeRate = getReducedFraction;
