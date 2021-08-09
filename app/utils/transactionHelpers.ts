import type { Buffer } from 'buffer/';
import { findEntries } from '~/database/AddressBookDao';
import { getTransactionStatus } from '../node/nodeRequests';
import { getDefaultExpiry, getNow, secondsSinceUnixEpoch } from './timeHelpers';
import {
    TransactionKindId,
    TransferTransaction,
    SimpleTransfer,
    TransactionEvent,
    TransactionStatus,
    ScheduledTransfer,
    EncryptedTransfer,
    Schedule,
    TransferToEncrypted,
    instanceOfUpdateInstruction,
    Transaction,
    AddedCredential,
    AccountTransaction,
    TransactionPayload,
    TimeStampUnit,
    TransactionAccountSignature,
    TransactionCredentialSignature,
    Account,
    AccountInfo,
    AddBaker,
    AddBakerPayload,
    RemoveBaker,
    UpdateBakerKeysPayload,
    UpdateBakerKeys,
    UpdateBakerStakePayload,
    UpdateBakerRestakeEarningsPayload,
    AddressBookEntry,
    UpdateBakerStake,
    UpdateBakerRestakeEarnings,
    TransactionKindString,
} from './types';
import {
    getTransactionEnergyCost,
    getTransactionKindEnergy,
    getUpdateAccountCredentialEnergy,
} from './transactionCosts';
import { toMicroUnits, isValidGTUString, displayAsGTU } from './gtu';

export async function lookupAddressBookEntry(
    address: string
): Promise<AddressBookEntry | undefined> {
    const entries = await findEntries({ address });
    return entries[0];
}

/**
 * Attempts to find the address in the accounts, and then AddressBookEntries
 * If the address is found, return the name, otherwise returns undefined;
 */
export async function lookupName(address: string): Promise<string | undefined> {
    return (await lookupAddressBookEntry(address))?.name;
}

interface CreateAccountTransactionInput<T> {
    fromAddress: string;
    expiry: Date;
    transactionKind: TransactionKindId;
    payload: T;
    estimatedEnergyAmount?: bigint;
    signatureAmount?: number;
    nonce: string;
}

/**
 *  Constructs an account transaction object,
 * @param fromAddress, the sender's address.
 * @param expiry, expiry of the transaction, is given as an unix timestamp.
 * @param transactionKind, the id of the TransactionKind of the transaction.
 * @param payload, the payload of the transaction.
 * @param estimatedEnergyAmount, is the energyAmount on the transaction. Should be used to overwrite the, internally calculated, energy amount, in case of incomplete payloads.
 * @param signatureAmount, is the number of signature, which will be put on the transaction. Is only used to generate energyAmount, and is ignored if estimatedEnergyAmount is given.
 * @param nonce, the next nonce on the sending account.
 */
function createAccountTransaction<T extends TransactionPayload>({
    fromAddress,
    expiry,
    transactionKind,
    payload,
    estimatedEnergyAmount,
    signatureAmount,
    nonce,
}: CreateAccountTransactionInput<T>): AccountTransaction<T> {
    const transaction: AccountTransaction<T> = {
        sender: fromAddress,
        nonce,
        expiry: BigInt(secondsSinceUnixEpoch(expiry)),
        energyAmount: '',
        transactionKind,
        payload,
    };
    if (!estimatedEnergyAmount) {
        transaction.energyAmount = getTransactionEnergyCost(
            transaction,
            signatureAmount
        ).toString();
    } else {
        transaction.energyAmount = estimatedEnergyAmount.toString();
    }
    return transaction;
}

/**
 *  Constructs a, simple transfer, transaction object,
 * Given the fromAddress, toAddress and the amount.
 */
export function createSimpleTransferTransaction(
    fromAddress: string,
    amount: BigInt,
    toAddress: string,
    nonce: string,
    signatureAmount = 1,
    expiry = getDefaultExpiry()
): SimpleTransfer {
    const payload = {
        toAddress,
        amount: amount.toString(),
    };
    return createAccountTransaction({
        fromAddress,
        expiry,
        transactionKind: TransactionKindId.Simple_transfer,
        payload,
        signatureAmount,
        nonce,
    });
}

/**
 *  Constructs an encrypted transfer object,
 * Given the fromAddress, toAddress and the amount.
 * N.B. Does not contain the actual payload, as this is done without access to the decryption key.
 */
export function createEncryptedTransferTransaction(
    fromAddress: string,
    amount: bigint,
    toAddress: string,
    nonce: string,
    expiry = getDefaultExpiry()
): EncryptedTransfer {
    const payload = {
        toAddress,
        plainTransferAmount: amount.toString(),
    };
    return createAccountTransaction({
        fromAddress,
        expiry,
        transactionKind: TransactionKindId.Encrypted_transfer,
        nonce,
        payload,
        // Supply the energy, so that the cost is not computed using the incomplete payload.
        estimatedEnergyAmount: getTransactionKindEnergy(
            TransactionKindId.Encrypted_transfer
        ),
    });
}

export function createShieldAmountTransaction(
    fromAddress: string,
    amount: bigint,
    nonce: string,
    expiry = getDefaultExpiry()
): TransferToEncrypted {
    const payload = {
        amount: amount.toString(),
    };
    return createAccountTransaction({
        fromAddress,
        expiry,
        transactionKind: TransactionKindId.Transfer_to_encrypted,
        payload,
        nonce,
    });
}

export function createUnshieldAmountTransaction(
    fromAddress: string,
    amount: BigInt,
    nonce: string,
    expiry = getDefaultExpiry()
) {
    const payload = {
        transferAmount: amount.toString(),
    };
    return createAccountTransaction({
        fromAddress,
        expiry,
        transactionKind: TransactionKindId.Transfer_to_public,
        payload,
        nonce,
        estimatedEnergyAmount: getTransactionKindEnergy(
            TransactionKindId.Transfer_to_public
        ), // Supply the energy, so that the cost is not computed using the incomplete payload.
    });
}

function createRegularIntervalScheduleInner(
    totalAmount: bigint,
    releases: number,
    getTimestamp: (index: number) => string
): Schedule {
    const releaseAmount = totalAmount / BigInt(releases);
    const restAmount = totalAmount % BigInt(releases);
    const schedule = [];
    for (let i = 0; i < releases - 1; i += 1) {
        schedule.push({
            amount: releaseAmount.toString(),
            timestamp: getTimestamp(i),
        });
    }
    schedule.push({
        amount: (releaseAmount + restAmount).toString(),
        timestamp: getTimestamp(releases - 1),
    });
    return schedule;
}

/**
 *  Creates a schedule, with the assumption that each release is
 *  the starting date's day and time in the subsequent months.
 * N.B. The days will shift if the release includes a month with less
 * days than the chosen starting day.
 */
export function createRegularIntervalSchedulePerMonth(
    totalAmount: bigint,
    releases: number,
    starting: Date
): Schedule {
    function getTimestamp(i: number) {
        const date = new Date(starting.getTime());
        date.setMonth(date.getMonth() + i);
        return date.getTime().toString();
    }
    return createRegularIntervalScheduleInner(
        totalAmount,
        releases,
        getTimestamp
    );
}

export function createRegularIntervalSchedule(
    totalAmount: bigint,
    releases: number,
    starting: number,
    interval: number
): Schedule {
    const getTimestamp = (i: number) => (starting + interval * i).toString();
    return createRegularIntervalScheduleInner(
        totalAmount,
        releases,
        getTimestamp
    );
}

/**
 *  Constructs a, simple transfer, transaction object,
 * Given the fromAddress, toAddress and the amount.
 */
export function createScheduledTransferTransaction(
    fromAddress: string,
    toAddress: string,
    schedule: Schedule,
    nonce: string,
    signatureAmount = 1,
    expiry = getDefaultExpiry()
) {
    const payload = {
        toAddress,
        schedule,
    };

    return createAccountTransaction({
        fromAddress,
        expiry,
        transactionKind: TransactionKindId.Transfer_with_schedule,
        payload,
        nonce,
        signatureAmount,
    });
}

/**
 *  Constructs an account credential update transaction,
 */
export function createUpdateCredentialsTransaction(
    fromAddress: string,
    addedCredentials: AddedCredential[],
    removedCredIds: string[],
    threshold: number,
    currentCredentialAmount: number,
    nonce: string,
    signatureAmount = 1,
    expiry = getDefaultExpiry()
) {
    const payload = {
        addedCredentials,
        removedCredIds,
        threshold,
    };

    return createAccountTransaction({
        fromAddress,
        expiry,
        transactionKind: TransactionKindId.Update_credentials,
        payload,
        nonce,
        estimatedEnergyAmount: getUpdateAccountCredentialEnergy(
            payload,
            currentCredentialAmount,
            signatureAmount
        ),
    });
}

export function createAddBakerTransaction(
    fromAddress: string,
    payload: AddBakerPayload,
    nonce: string,
    signatureAmount = 1,
    expiry = getDefaultExpiry()
): AddBaker {
    return createAccountTransaction({
        fromAddress,
        expiry,
        transactionKind: TransactionKindId.Add_baker,
        payload,
        nonce,
        signatureAmount,
    });
}

export function createUpdateBakerKeysTransaction(
    fromAddress: string,
    payload: UpdateBakerKeysPayload,
    nonce: string,
    signatureAmount = 1,
    expiry = getDefaultExpiry()
): UpdateBakerKeys {
    return createAccountTransaction({
        fromAddress,
        expiry,
        transactionKind: TransactionKindId.Update_baker_keys,
        nonce,
        payload,
        signatureAmount,
    });
}

export function createRemoveBakerTransaction(
    fromAddress: string,
    nonce: string,
    signatureAmount = 1,
    expiry = getDefaultExpiry()
): RemoveBaker {
    return createAccountTransaction({
        fromAddress,
        expiry,
        transactionKind: TransactionKindId.Remove_baker,
        nonce,
        payload: {},
        signatureAmount,
    });
}

export function createUpdateBakerStakeTransaction(
    fromAddress: string,
    payload: UpdateBakerStakePayload,
    nonce: string,
    signatureAmount = 1,
    expiry = getDefaultExpiry()
): UpdateBakerStake {
    return createAccountTransaction({
        fromAddress,
        expiry,
        transactionKind: TransactionKindId.Update_baker_stake,
        nonce,
        payload,
        signatureAmount,
    });
}

export function createUpdateBakerRestakeEarningsTransaction(
    fromAddress: string,
    payload: UpdateBakerRestakeEarningsPayload,
    nonce: string,
    signatureAmount = 1,
    expiry = getDefaultExpiry()
): UpdateBakerRestakeEarnings {
    return createAccountTransaction({
        fromAddress,
        expiry,
        transactionKind: TransactionKindId.Update_baker_restake_earnings,
        nonce,
        payload,
        signatureAmount,
    });
}

export interface StatusResponse {
    status: TransactionStatus;
    outcomes: Record<string, TransactionEvent>;
}

/**
 * Queries the node for the status of the transaction with the provided transaction hash.
 * The polling will continue until the transaction becomes absent or finalized.
 * @param transactionHash the hash of the transaction to get the status for
 * @param pollingIntervalM, optional, interval between polling in milliSeconds, defaults to every 20 seconds.
 */
export async function getStatus(
    transactionHash: string,
    pollingIntervalMs = 20000
): Promise<StatusResponse> {
    return new Promise((resolve) => {
        const interval = setInterval(async () => {
            let response;
            try {
                response = (
                    await getTransactionStatus(transactionHash)
                ).getValue();
            } catch (err) {
                // This happens if the node cannot be reached. Just wait for the next
                // interval and try again.
                return;
            }
            if (response === 'null') {
                clearInterval(interval);
                resolve({ status: TransactionStatus.Rejected, outcomes: {} });
                return;
            }

            const parsedResponse = JSON.parse(response);
            if (parsedResponse.status === 'finalized') {
                clearInterval(interval);
                resolve(parsedResponse);
            }
        }, pollingIntervalMs);
    });
}

export function getScheduledTransferAmount(
    transaction: ScheduledTransfer
): bigint {
    return transaction.payload.schedule.reduce(
        (total, point) => total + BigInt(point.amount),
        0n
    );
}

export function isFailed(transaction: TransferTransaction) {
    return [TransactionStatus.Rejected, TransactionStatus.Failed].includes(
        transaction.status
    );
}

/**
 * Get the timeout/expiry of a transaction.
 * For an update instruction this is the timeout.
 * For an account transation this is the expiry.
 */
export function getTimeout(transaction: Transaction) {
    if (instanceOfUpdateInstruction(transaction)) {
        return transaction.header.timeout;
    }
    return transaction.expiry;
}

/** Used to build a simple TransactionAccountSignature, with only a single signature. */
export function buildTransactionAccountSignature(
    credentialAccountIndex: number,
    signatureIndex: number,
    signature: Buffer
): TransactionAccountSignature {
    const transactionCredentialSignature: TransactionCredentialSignature = {};
    transactionCredentialSignature[signatureIndex] = signature.toString('hex');
    const transactionAccountSignature: TransactionAccountSignature = {};
    transactionAccountSignature[
        credentialAccountIndex
    ] = transactionCredentialSignature;
    return transactionAccountSignature;
}

export function isSuccessfulTransaction(event: TransactionEvent) {
    return event.result.outcome === 'success';
}

export const isExpired = (transaction: Transaction) =>
    getTimeout(transaction) <= getNow(TimeStampUnit.seconds);

export function amountAtDisposal(accountInfo: AccountInfo): bigint {
    const unShielded = BigInt(accountInfo.accountAmount);
    const stakedAmount = accountInfo.accountBaker
        ? BigInt(accountInfo.accountBaker.stakedAmount)
        : 0n;
    const scheduled = accountInfo.accountReleaseSchedule
        ? BigInt(accountInfo.accountReleaseSchedule.total)
        : 0n;
    return unShielded - scheduled - stakedAmount;
}

export function validateShieldedAmount(
    amountToValidate: string,
    account: Account | undefined,
    accountInfo: AccountInfo | undefined,
    estimatedFee: bigint | undefined
): string | undefined {
    if (!isValidGTUString(amountToValidate)) {
        return 'Value is not a valid GTU amount';
    }
    const amountToValidateMicroGTU = toMicroUnits(amountToValidate);
    if (accountInfo && amountAtDisposal(accountInfo) < (estimatedFee || 0n)) {
        return 'Insufficient public funds to cover fee';
    }
    if (
        account?.totalDecrypted &&
        BigInt(account.totalDecrypted) < amountToValidateMicroGTU
    ) {
        return 'Insufficient shielded funds';
    }
    if (amountToValidateMicroGTU === 0n) {
        return 'Amount may not be zero';
    }
    return undefined;
}

export function validateTransferAmount(
    amountToValidate: string,
    accountInfo: AccountInfo | undefined,
    estimatedFee: bigint | undefined
): string | undefined {
    if (!isValidGTUString(amountToValidate)) {
        return 'Value is not a valid GTU amount';
    }
    const amountToValidateMicroGTU = toMicroUnits(amountToValidate);
    if (
        accountInfo &&
        amountAtDisposal(accountInfo) <
            amountToValidateMicroGTU + (estimatedFee || 0n)
    ) {
        return 'Insufficient funds';
    }
    if (amountToValidateMicroGTU === 0n) {
        return 'Amount may not be zero';
    }
    return undefined;
}

export function validateFee(
    accountInfo: AccountInfo | undefined,
    estimatedFee: bigint | undefined
): string | undefined {
    if (accountInfo && amountAtDisposal(accountInfo) < (estimatedFee || 0n)) {
        return 'Insufficient funds';
    }
    return undefined;
}

function amountToStakeAtDisposal(accountInfo: AccountInfo): bigint {
    const unShielded = BigInt(accountInfo.accountAmount);
    const scheduled = accountInfo.accountReleaseSchedule
        ? BigInt(accountInfo.accountReleaseSchedule.total)
        : 0n;
    return unShielded - scheduled;
}

export function validateBakerStake(
    bakerStakeThreshold: bigint | undefined,
    amountToValidate: string,
    accountInfo: AccountInfo | undefined,
    estimatedFee: bigint | undefined
): string | undefined {
    if (!isValidGTUString(amountToValidate)) {
        return 'Value is not a valid GTU amount';
    }
    const amount = toMicroUnits(amountToValidate);
    if (bakerStakeThreshold && bakerStakeThreshold > amount) {
        return `Stake is below the threshold (${displayAsGTU(
            bakerStakeThreshold
        )}) for baking `;
    }
    if (
        accountInfo &&
        amountToStakeAtDisposal(accountInfo) < amount + (estimatedFee || 0n)
    ) {
        return 'Insufficient funds';
    }

    return undefined;
}

export function isTransferKind(kind: TransactionKindString) {
    switch (kind) {
        case TransactionKindString.Transfer:
        case TransactionKindString.TransferToEncrypted:
        case TransactionKindString.TransferToPublic:
        case TransactionKindString.TransferWithSchedule:
        case TransactionKindString.EncryptedAmountTransfer:
            return true;
        default:
            return false;
    }
}

export function isRewardKind(kind: TransactionKindString) {
    switch (kind) {
        case TransactionKindString.BakingReward:
        case TransactionKindString.BlockReward:
        case TransactionKindString.FinalizationReward:
            return true;
        default:
            return false;
    }
}

export function isOutgoingTransaction(
    transaction: TransferTransaction,
    accountAddress: string
) {
    return transaction.fromAddress === accountAddress;
}
