import { Validate, ValidationRule } from 'react-hook-form';
import { isHex, onlyDigitsNoLeadingZeroes } from '~/utils/basicHelpers';

export const requiredMessage = (name: string) => `${name} is required`;
export const pasteHere = (name: string) => `Paste ${name} here`;
export const enterHere = (name: string) => `Enter ${name} here`;

export const validateHex: (name: string) => Validate = (name: string) => (
    v: string
) => isHex(v) || `${name} must be HEX format`;

export const lengthRule: (
    name: string,
    desiredLength: number
) => ValidationRule<number> = (name: string, desiredLength: number) => ({
    value: desiredLength,
    message: `${name} must be ${desiredLength} characters`,
});

export const mustBeAnInteger: Validate = (v) =>
    onlyDigitsNoLeadingZeroes(v) || 'Must be a valid integer';

export const validationRulesForPositiveWord64 = (name: string) => ({
    required: requiredMessage(name),
    min: {
        value: 1,
        message: `The ${name} must be positive`,
    },
    max: {
        value: '18446744073709551615',
        message: `The ${name} must be below 18446744073709551615`,
    },
    validate: {
        mustBeAnInteger,
    },
});
