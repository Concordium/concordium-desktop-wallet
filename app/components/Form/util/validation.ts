import { Validate } from 'react-hook-form';
import { isValidBigInt } from '~/utils/numberStringHelpers';

export const minDate = (min: Date, message?: string): Validate => (v: Date) => {
    return v > min ? true : message || false;
};

export const maxDate = (max: Date, message?: string): Validate => (v: Date) => {
    return v < max ? true : message || false;
};

export const futureDate = (message?: string): Validate =>
    minDate(new Date(), message);

export const validBigInt = (message?: string): Validate => (value: string) => {
    return isValidBigInt(value) || message || false;
};
