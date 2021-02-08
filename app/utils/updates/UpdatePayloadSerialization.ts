import { ExchangeRate } from '../types';

/**
 * Serializes an ExchangeRate to bytes.
 */
export default function serializeExchangeRate(exchangeRate: ExchangeRate) {
    const serializedExchangeRate = Buffer.alloc(16);
    serializedExchangeRate.writeBigUInt64BE(BigInt(exchangeRate.numerator), 0);
    serializedExchangeRate.writeBigUInt64BE(
        BigInt(exchangeRate.denominator),
        8
    );
    return serializedExchangeRate;
}
