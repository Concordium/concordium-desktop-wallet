import { Validate } from 'react-hook-form';

import { isValidBigInt } from '~/utils/numberStringHelpers';
import { ExchangeRate } from '~/utils/types';

export type RelativeRateValue = {
    [P in keyof ExchangeRate]: string | undefined;
};

const validatePositiveNumber = (v = '') => parseInt(v, 10) > 0;

export const isValidRelativeRatePart = (v = '') =>
    validatePositiveNumber(v) && isValidBigInt(v);

export const isPositiveNumber: Validate = (value: RelativeRateValue) =>
    Object.values(value)
        .map(validatePositiveNumber)
        .every((v) => v === true) || 'Values must above 1';

export const validBigIntValues: Validate = (value: RelativeRateValue) =>
    Object.values(value)
        .map(isValidBigInt)
        .every((v) => v === true) || 'Values must be whole numbers';

export const notEqual = (currentValue: RelativeRateValue): Validate => (
    value: RelativeRateValue
) =>
    (value.denominator !== currentValue.denominator &&
        value.numerator !== currentValue.numerator) ||
    "Value hasn't changed";

export const fromExchangeRate = (rate: ExchangeRate): RelativeRateValue => ({
    denominator: rate.denominator.toString(),
    numerator: rate.numerator.toString(),
});
