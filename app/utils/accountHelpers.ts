import { RegisterOptions, Validate } from 'react-hook-form';
import bs58check from 'bs58check';
import { AccountInfoBaker, AccountInfoDelegator } from '@concordium/web-sdk';
import {
    Account,
    AccountInfo,
    BooleanFilters,
    TransactionFilter,
    TransactionKindString,
    AccountStatus,
} from './types';
import { max } from './basicHelpers';

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
export function hasEncryptedBalance(account: Account): boolean {
    return (
        account.selfAmounts !== ENCRYPTED_ZERO ||
        account.incomingAmounts !== '[]'
    );
}

export function isMultiSig(account: Account): boolean {
    return (account.signatureThreshold ?? 0) > 1;
}

export function isMultiCred(accountInfo: AccountInfo): boolean {
    return Object.values(accountInfo.accountCredentials).length > 1;
}

export function createAccount(
    identityId: number,
    address: string,
    status: AccountStatus,
    name = address.substr(0, 8),
    signatureThreshold = 1,
    isInitial = false,
    deploymentTransactionId?: string
): Account {
    return {
        name,
        identityId,
        status,
        address,
        signatureThreshold,
        isInitial,
        deploymentTransactionId,
        transactionFilter: {},
        selfAmounts: ENCRYPTED_ZERO,
        incomingAmounts: '[]',
        totalDecrypted: '0',
    };
}

export function createInitialAccount(
    address: string,
    status: AccountStatus,
    name = address.substr(0, 8)
): Omit<Account, 'identityId'> {
    return {
        name,
        status,
        address,
        signatureThreshold: 1,
        isInitial: true,
        transactionFilter: {},
        selfAmounts: ENCRYPTED_ZERO,
        incomingAmounts: '[]',
        totalDecrypted: '0',
    };
}

export function getActiveBooleanFilters({
    fromDate,
    toDate,
    ...filters
}: TransactionFilter): TransactionKindString[] {
    const fullFilter: BooleanFilters = {};

    // eslint-disable-next-line no-restricted-syntax
    for (const k in TransactionKindString) {
        if (Object.prototype.hasOwnProperty.call(TransactionKindString, k)) {
            const kind =
                TransactionKindString[k as keyof typeof TransactionKindString];
            fullFilter[kind] = filters[kind] ?? true;
        }
    }

    return Object.entries(fullFilter as BooleanFilters)
        .filter(([, v]) => v)
        .map(([kind]) => kind as TransactionKindString);
}

interface PublicAccountAmounts {
    total: bigint;
    staked: bigint;
    scheduled: bigint;
    atDisposal: bigint;
}

/**
 * Function to determine the parts of an account's public balance
 * The only amount, which is not directly extracted from the accountInfo is atDisposal, which
 * is calculated as "total - max(scheduled, staked)". This is because the staked amount uses the scheduled first.
 * @param accountInfo the accountInfo to extract the amounts from. If not given, then all balances are set to 0.
 * @returns an object containing the staked, scheduled, at disposal and total public balance.
 */
export function getPublicAccountAmounts(
    accountInfo?: AccountInfo
): PublicAccountAmounts {
    if (!accountInfo) {
        return { total: 0n, staked: 0n, scheduled: 0n, atDisposal: 0n };
    }
    const total = BigInt(accountInfo.accountAmount.microCcdAmount);
    const staked =
        (accountInfo as AccountInfoBaker).accountBaker?.stakedAmount ??
        (accountInfo as AccountInfoDelegator).accountDelegation?.stakedAmount ??
        0n;
    const scheduled = accountInfo.accountReleaseSchedule
        ? BigInt(accountInfo.accountReleaseSchedule.total.microCcdAmount)
        : 0n;
    const atDisposal = total - max(scheduled, staked.microCcdAmount);
    return { total, staked: staked.microCcdAmount, scheduled, atDisposal };
}

export function getAmountAtDisposal(accountInfo: AccountInfo): bigint {
    return getPublicAccountAmounts(accountInfo).atDisposal;
}
