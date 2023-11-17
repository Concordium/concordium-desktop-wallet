import type { Buffer } from 'buffer/';
import {
    BlockItemSummary,
    ReleaseSchedule,
    TransactionSummaryType,
    TransactionKindString,
} from '@concordium/web-sdk';
import { Validate } from 'react-hook-form';
import {
    dateFromTimeStamp,
    getDefaultExpiry,
    getNow,
    secondsSinceUnixEpoch,
} from './timeHelpers';
import {
    TransactionKindId,
    TransferTransaction,
    SimpleTransfer,
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
    RegisterData,
    RemoveBaker,
    UpdateBakerKeysPayload,
    UpdateBakerKeys,
    UpdateBakerStakePayload,
    UpdateBakerRestakeEarningsPayload,
    UpdateBakerStake,
    UpdateBakerRestakeEarnings,
    SimpleTransferWithMemo,
    TransactionStatus,
    SchedulePoint,
    ConfigureBakerPayload,
    ConfigureBaker,
    ConfigureDelegationPayload,
    ConfigureDelegation,
} from './types';
import {
    getTransactionEnergyCost,
    getTransactionKindEnergy,
    getUpdateAccountCredentialEnergy,
    getPayloadSizeEstimate,
} from './transactionCosts';
import { ccdToMicroCcd, isValidCcdString, displayAsCcd } from './ccd';
import { getEncodedSize } from './cborHelper';
import externalConstants from '~/constants/externalConstants.json';
import { isASCII } from './basicHelpers';
import { getAmountAtDisposal } from './accountHelpers';

interface CreateAccountTransactionInput<T> {
    fromAddress: string;
    expiry: Date;
    transactionKind: TransactionKindId;
    payload: T;
    estimatedEnergyAmount?: bigint;
    signatureAmount?: number;
    nonce: bigint;
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
        nonce: nonce.toString(),
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
 *  Constructs a simple transfer transaction object,
 * Given the fromAddress, toAddress and the amount.
 */
export function createSimpleTransferTransaction(
    fromAddress: string,
    amount: BigInt,
    toAddress: string,
    nonce: bigint,
    signatureAmount = 1,
    expiry = getDefaultExpiry()
): SimpleTransfer {
    const payload = {
        toAddress,
        amount: amount.toString(),
    };
    const transactionKind = TransactionKindId.Simple_transfer;
    return createAccountTransaction({
        fromAddress,
        expiry,
        transactionKind,
        payload,
        signatureAmount,
        nonce,
    });
}

/**
 *  Constructs a simple transfer with memo transaction object,
 * Given the fromAddress, toAddress and the amount.
 */
export function createSimpleTransferWithMemoTransaction(
    fromAddress: string,
    amount: BigInt,
    toAddress: string,
    nonce: bigint,
    memo: string,
    signatureAmount = 1,
    expiry = getDefaultExpiry()
): SimpleTransferWithMemo {
    const payload = {
        toAddress,
        amount: amount.toString(),
        memo,
    };
    const transactionKind = TransactionKindId.Simple_transfer_with_memo;
    return createAccountTransaction({
        fromAddress,
        expiry,
        transactionKind,
        payload,
        signatureAmount,
        nonce,
    });
}

/**
 *  Constructs a register data transaction object.
 */
export function createRegisterDataTransaction(
    fromAddress: string,
    nonce: bigint,
    data: string,
    signatureAmount = 1,
    expiry = getDefaultExpiry()
): RegisterData {
    const payload = {
        data,
    };
    const transactionKind = TransactionKindId.Register_data;
    return createAccountTransaction({
        fromAddress,
        expiry,
        transactionKind,
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
    nonce: bigint,
    memo?: string,
    expiry = getDefaultExpiry()
): EncryptedTransfer {
    const payload = {
        toAddress,
        memo,
        plainTransferAmount: amount.toString(),
    };
    const transactionKind = memo
        ? TransactionKindId.Encrypted_transfer_with_memo
        : TransactionKindId.Encrypted_transfer;

    return createAccountTransaction({
        fromAddress,
        expiry,
        transactionKind,
        nonce,
        payload,
        // Supply the energy, so that the cost is not computed using the incomplete payload.
        estimatedEnergyAmount: getTransactionKindEnergy(
            transactionKind,
            getPayloadSizeEstimate(TransactionKindId.Encrypted_transfer) +
                2 +
                getEncodedSize(memo)
        ),
    });
}

export function createShieldAmountTransaction(
    fromAddress: string,
    amount: bigint,
    nonce: bigint,
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
    nonce: bigint,
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
    nonce: bigint,
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
 *  Constructs a, simple transfer, transaction object,
 * Given the fromAddress, toAddress and the amount.
 */
export function createScheduledTransferWithMemoTransaction(
    fromAddress: string,
    toAddress: string,
    schedule: Schedule,
    nonce: bigint,
    memo: string,
    signatureAmount = 1,
    expiry = getDefaultExpiry()
) {
    const payload = {
        toAddress,
        schedule,
        memo,
    };

    return createAccountTransaction({
        fromAddress,
        expiry,
        transactionKind: TransactionKindId.Transfer_with_schedule_and_memo,
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
    nonce: bigint,
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
    nonce: bigint,
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
    nonce: bigint,
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
    nonce: bigint,
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
    nonce: bigint,
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
    nonce: bigint,
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

export function createConfigureBakerTransaction(
    fromAddress: string,
    payload: ConfigureBakerPayload,
    nonce: bigint,
    signatureAmount = 1,
    expiry = getDefaultExpiry()
): ConfigureBaker {
    return createAccountTransaction({
        fromAddress,
        expiry,
        transactionKind: TransactionKindId.Configure_baker,
        nonce,
        payload,
        signatureAmount,
    });
}

export function createConfigureDelegationTransaction(
    fromAddress: string,
    payload: ConfigureDelegationPayload,
    nonce: bigint,
    signatureAmount = 1,
    expiry = getDefaultExpiry()
): ConfigureDelegation {
    return createAccountTransaction({
        fromAddress,
        expiry,
        transactionKind: TransactionKindId.Configure_delegation,
        nonce,
        payload,
        signatureAmount,
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

export function isSuccessfulTransaction(summary: BlockItemSummary) {
    if (summary.type === TransactionSummaryType.AccountTransaction) {
        return summary.transactionType !== TransactionKindString.Failed;
    }
    // Other block items don't fail
    return true;
}

export const isExpired = (transaction: Transaction) =>
    getTimeout(transaction) <= getNow(TimeStampUnit.seconds);

export function validateShieldedAmount(
    amountToValidate: string,
    account: Account | undefined,
    accountInfo: AccountInfo | undefined,
    estimatedFee: bigint | undefined
): string | undefined {
    if (!isValidCcdString(amountToValidate)) {
        return 'Value is not a valid CCD amount';
    }
    const amountToValidateMicroGTU = ccdToMicroCcd(amountToValidate);
    if (
        accountInfo &&
        getAmountAtDisposal(accountInfo) < (estimatedFee || 0n)
    ) {
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
    if (!isValidCcdString(amountToValidate)) {
        return 'Value is not a valid CCD amount';
    }
    const amountToValidateMicroGTU = ccdToMicroCcd(amountToValidate);
    if (
        accountInfo &&
        getAmountAtDisposal(accountInfo) <
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
    if (
        accountInfo &&
        getAmountAtDisposal(accountInfo) < (estimatedFee || 0n)
    ) {
        return 'Insufficient funds';
    }
    return undefined;
}

export const validateDelegateAmount = (
    accountInfo: AccountInfo,
    estimatedFee: bigint,
    max?: bigint
): Validate => (value: string) => {
    if (!isValidCcdString(value)) {
        return 'Value is not a valid CCD amount';
    }

    const amount = ccdToMicroCcd(value);

    if (amount === 0n) {
        return `Delegated amount must be positive`;
    }

    if (max !== undefined && amount > max) {
        return `Cannot delegate more than (${displayAsCcd(max)})`;
    }

    if (BigInt(accountInfo.accountAmount) < amount + estimatedFee) {
        return 'Insufficient funds';
    }

    return true;
};

export function validateBakerStake(
    bakerStakeThreshold: bigint | undefined,
    amountToValidate: string,
    accountInfo: AccountInfo | undefined,
    estimatedFee: bigint | undefined
): string | undefined {
    if (!isValidCcdString(amountToValidate)) {
        return 'Value is not a valid CCD amount';
    }
    const amount = ccdToMicroCcd(amountToValidate);
    if (bakerStakeThreshold && bakerStakeThreshold > amount) {
        return `Stake is below the threshold (${displayAsCcd(
            bakerStakeThreshold
        )}) for validation`;
    }
    if (
        accountInfo &&
        BigInt(accountInfo.accountAmount) < amount + (estimatedFee || 0n)
    ) {
        return 'Insufficient funds';
    }

    return undefined;
}

export function validateData(data: string, name = 'Data'): string | undefined {
    const asNumber = Number(data);
    if (
        Number.isInteger(asNumber) &&
        (asNumber > Number.MAX_SAFE_INTEGER ||
            asNumber < Number.MIN_SAFE_INTEGER)
    ) {
        return `Numbers greater than ${Number.MAX_SAFE_INTEGER} or smaller than ${Number.MIN_SAFE_INTEGER} are not supported`;
    }
    if (getEncodedSize(data) > externalConstants.maxMemoSize) {
        return `${name} is too large, encoded size must be at most ${externalConstants.maxMemoSize} bytes`;
    }
    // Check that the memo only contains ascii characters
    if (!isASCII(data)) {
        return `${name} contains non-ascii characters`;
    }
    return undefined;
}

export function validateMemo(memo: string): string | undefined {
    return validateData(memo, 'Memo');
}

export function isTransferKind(kind: TransactionKindString) {
    switch (kind) {
        case TransactionKindString.Transfer:
        case TransactionKindString.TransferWithMemo:
        case TransactionKindString.TransferToEncrypted:
        case TransactionKindString.TransferToPublic:
        case TransactionKindString.TransferWithSchedule:
        case TransactionKindString.TransferWithScheduleAndMemo:
        case TransactionKindString.EncryptedAmountTransfer:
        case TransactionKindString.EncryptedAmountTransferWithMemo:
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
        case TransactionKindString.StakingReward:
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

/**
 * Determine whether the transaction affects unshielded balance.
 */
export function isUnshieldedBalanceTransaction(
    transaction: TransferTransaction,
    currentAddress: string
) {
    return !(
        [
            TransactionKindString.EncryptedAmountTransfer,
            TransactionKindString.EncryptedAmountTransferWithMemo,
        ].includes(transaction.transactionKind) &&
        transaction.fromAddress !== currentAddress
    );
}

/**
 * Determine whether the transaction affects shielded balance.
 */
export function isShieldedBalanceTransaction(transaction: TransferTransaction) {
    switch (transaction.transactionKind) {
        case TransactionKindString.EncryptedAmountTransfer:
        case TransactionKindString.EncryptedAmountTransferWithMemo:
        case TransactionKindString.TransferToEncrypted:
        case TransactionKindString.TransferToPublic:
            return true;
        default:
            return false;
    }
}

export function toReleaseSchedule(release: SchedulePoint): ReleaseSchedule {
    return {
        amount: BigInt(release.amount),
        timestamp: dateFromTimeStamp(
            release.timestamp,
            TimeStampUnit.milliSeconds
        ),
    };
}
