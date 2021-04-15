import { ExchangeRate } from '~/utils/types';

export const getFoundationTransactionPageTitle = (transactionType: string) =>
    `Foundation Transaction | ${transactionType}`;

/**
 * Exchange rates are deserialized in a manner that converts to either numbers or bigints. This is to ensure we can trust the interface.
 */
export const ensureBigIntValues = (rate: ExchangeRate): ExchangeRate => ({
    denominator: BigInt(rate.denominator),
    numerator: BigInt(rate.numerator),
});
