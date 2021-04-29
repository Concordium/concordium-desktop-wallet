import bs58check from 'bs58check';
import { RegisterOptions, Validate } from 'react-hook-form';
import { Account } from './types';

// Given a string, checks if it is a valid bs58check address.
// TODO: check length?
export function isValidAddress(address: string): boolean {
    try {
        if (!address) {
            return false;
        }
        bs58check.decode(address); // This function should throw an error if input has an invalid checksum.x
    } catch (e) {
        return false;
    }
    return true;
}

const addressFormat: Validate = (address: string) =>
    isValidAddress(address) || 'Address format is invalid';

export const commonAddressValidators: RegisterOptions = {
    minLength: {
        value: 50,
        message: 'Address should be 50 characters',
    },
    maxLength: {
        value: 50,
        message: 'Address should be 50 characters',
    },
    validate: {
        addressFormat,
    },
};

export function isInitialAccount(account: Account): boolean {
    return account.isInitial;
}
