/* eslint-disable import/prefer-default-export */
import { Validate } from 'react-hook-form';

export const isValidBigInt = (value: string) => {
    try {
        BigInt(value);
        return true;
    } catch {
        return false;
    }
};

export const isValidBigIntValidator = (message?: string): Validate => (
    value: string
) => {
    return isValidBigInt(value) || message || false;
};
