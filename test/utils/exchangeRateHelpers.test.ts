import { reduceFraction } from '../../app/utils/exchangeRateHelpers';

describe(reduceFraction, () => {
    test('Correctly reduces fractions', () => {
        expect(reduceFraction(1n, 5n).map(Number)).toStrictEqual([1, 5]);
        expect(reduceFraction(5n, 5n).map(Number)).toStrictEqual([1, 1]);
        expect(reduceFraction(2n, 4n).map(Number)).toStrictEqual([1, 2]);
        expect(reduceFraction(15n, 2n).map(Number)).toStrictEqual([15, 2]);
        expect(reduceFraction(7n, 1n).map(Number)).toStrictEqual([7, 1]);
    });
});
