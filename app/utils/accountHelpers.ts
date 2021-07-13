import { RegisterOptions, Validate } from 'react-hook-form';
import bs58check from 'bs58check';
import { Account, AccountInfo } from './types';

export const ACCOUNT_NAME_MAX_LENGTH = 25;
export const ADDRESS_LENGTH = 50;

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
        bs58check.decode(address);
    } catch {
        return false;
    }
    return true;
}

const addressFormat: Validate = (address: string) =>
    isValidAddress(address) || 'Address format is invalid';

export const commonAddressValidators: RegisterOptions = {
    minLength: {
        value: ADDRESS_LENGTH,
        message: `Address should be ${ADDRESS_LENGTH} characters`,
    },
    maxLength: {
        value: ADDRESS_LENGTH,
        message: `Address should be ${ADDRESS_LENGTH} characters`,
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

/**
 * If an account has ever had an ecrypted balance different from 0, this will return true.
 */
export function hasEncryptedBalance(accountInfo: AccountInfo): boolean {
    return (
        accountInfo.accountEncryptedAmount.selfAmount !== ENCRYPTED_ZERO ||
        accountInfo.accountEncryptedAmount.incomingAmounts.length > 0
    );
}

export function isMultiSig(account: Account): boolean {
    return (account.signatureThreshold ?? 0) > 1;
}

export function isMultiCred(accountInfo: AccountInfo): boolean {
    return Object.values(accountInfo.accountCredentials).length > 1;
}

export function getInitialEncryptedAmount() {
    return ENCRYPTED_ZERO;
}
