import { reduceExchangeRate } from '../../app/utils/exchangeRateHelpers';

describe(reduceExchangeRate, () => {
    test('Correctly reduces fractions', () => {
        expect(reduceExchangeRate(1n, 5n).map(Number)).toStrictEqual([1, 5]);
        expect(reduceExchangeRate(5n, 5n).map(Number)).toStrictEqual([1, 1]);
        expect(reduceExchangeRate(2n, 4n).map(Number)).toStrictEqual([1, 2]);
        expect(reduceExchangeRate(15n, 2n).map(Number)).toStrictEqual([15, 2]);
        expect(reduceExchangeRate(7n, 1n).map(Number)).toStrictEqual([7, 1]);
    });
});
