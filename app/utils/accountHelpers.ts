import bs58check from 'bs58check';
import { RegisterOptions, Validate } from 'react-hook-form';
import { Account, AccountInfo } from './types';

/**
 * Verifies whether an address string is a valid Base58check string.
 * @param address the string to check whether is a valid Base58check string or not
 * @returns true if the address is a valid Base58check string, otherwise false
 */
export function isValidAddress(address: string): boolean {
    if (!address) {
        return false;
    }

    try {
        // This call throws an error if the input is not a valid
        bs58check.decode(address);
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

/**
 * Determines whether or not the account is an initial account, i.e. if the account
 * was created as the first account as part of the identity creation process.
 * @param account the account to check for being an initial account
 * @returns true if the account is an initial account, otherwise false
 */
export function isInitialAccount(account: Account): boolean {
    return account.isInitial;
}

const ENCRYPTED_ZERO =
    'c00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000c00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000c00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000c00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000';

export function hasEncryptedBalance(accountInfo: AccountInfo): boolean {
    return (
        accountInfo.accountEncryptedAmount.selfAmount !== ENCRYPTED_ZERO ||
        accountInfo.accountEncryptedAmount.incomingAmounts.length > 0
    );
}
