import { findEntries } from '../database/AddressBookDao';
import { getNextAccountNonce, getTransactionStatus } from './nodeRequests';
import { getDefaultExpiry, getNow } from './timeHelpers';
import {
    TransactionKindId,
    TransferTransaction,
    SimpleTransfer,
    TransactionEvent,
    TransactionStatus,
    ScheduledTransfer,
    SchedulePoint,
    TransferToEncrypted,
    instanceOfUpdateInstruction,
    Transaction,
    AddedCredential,
    AccountTransaction,
    TransactionPayload,
    TimeStampUnit,
    TransactionAccountSignature,
    TransactionCredentialSignature,
    AccountInfo,
    AddBaker,
    AddBakerPayload,
    RemoveBaker,
    UpdateBakerKeysPayload,
    UpdateBakerKeys,
} from './types';
import {
    getTransactionEnergyCost,
    getTransactionKindEnergy,
    getUpdateAccountCredentialEnergy,
} from './transactionCosts';
import { toMicroUnits, isValidGTUString } from './gtu';

/**
 * Attempts to find the address in the accounts, and then AddressBookEntries
 * If the address is found, return the name, otherwise returns undefined;
 */
export async function lookupName(address: string): Promise<string | undefined> {
    const entries = await findEntries({ address });
    if (entries.length > 0) {
        return entries[0].name;
    }
    return undefined;
}

/**
 * Attempts to find names on the addresses of the transaction, and adds
 * toAddressName/fromAddressName fields, if successful.
 * returns the potentially modified transaction.
 */
async function attachName(
    transaction: TransferTransaction
): Promise<TransferTransaction> {
    const updatedTransaction = { ...transaction };
    const toName = await lookupName(transaction.toAddress);
    if (toName) {
        updatedTransaction.toAddressName = toName;
    }
    const fromName = await lookupName(transaction.fromAddress);
    if (fromName) {
        updatedTransaction.fromAddressName = fromName;
    }
    return updatedTransaction;
}

/**
 * AttachName for a list of transaction. See attachName.
 */
export async function attachNames(
    transactions: TransferTransaction[]
): Promise<TransferTransaction[]> {
    return Promise.all(transactions.map(attachName));
}

interface CreateAccountTransactionInput<T> {
    fromAddress: string;
    expiry: bigint;
    transactionKind: TransactionKindId;
    payload: T;
    estimatedEnergyAmount?: bigint;
    signatureAmount?: number;
}

/**
 *  Constructs an account transaction object,
 * @param fromAddress, the sender's address.
 * @param expiry, expiry of the transaction, is given as an unix timestamp.
 * @param transactionKind, the id of the TransactionKind of the transaction.
 * @param payload, the payload of the transaction.
 * @param estimatedEnergyAmount, is the energyAmount on the transaction. Should be used to overwrite the, internally calculated, energy amount, in case of incomplete payloads.
 * @param signatureAmount, is the number of signature, which will be put on the transaction. Is only used to generate energyAmount, and is ignored if estimatedEnergyAmount is given.
 */
async function createAccountTransaction<T extends TransactionPayload>({
    fromAddress,
    expiry,
    transactionKind,
    payload,
    estimatedEnergyAmount,
    signatureAmount,
}: CreateAccountTransactionInput<T>): Promise<AccountTransaction<T>> {
    const { nonce } = await getNextAccountNonce(fromAddress);
    const transaction: AccountTransaction<T> = {
        sender: fromAddress,
        nonce,
        expiry,
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
    signatureAmount = 1,
    expiry: bigint = getDefaultExpiry()
): Promise<SimpleTransfer> {
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
    });
}

export function createShieldAmountTransaction(
    fromAddress: string,
    amount: bigint,
    expiry: bigint = getDefaultExpiry()
): Promise<TransferToEncrypted> {
    const payload = {
        amount: amount.toString(),
    };
    return createAccountTransaction({
        fromAddress,
        expiry,
        transactionKind: TransactionKindId.Transfer_to_encrypted,
        payload,
    });
}

export async function createUnshieldAmountTransaction(
    fromAddress: string,
    amount: BigInt,
    expiry: bigint = getDefaultExpiry()
) {
    const payload = {
        transferAmount: amount.toString(),
    };
    return createAccountTransaction({
        fromAddress,
        expiry,
        transactionKind: TransactionKindId.Transfer_to_public,
        payload,
        estimatedEnergyAmount: getTransactionKindEnergy(
            TransactionKindId.Transfer_to_public
        ), // Supply the energy, so that the cost is not computed using the incomplete payload.
    });
}

export function createRegularIntervalSchedule(
    totalAmount: bigint,
    releases: number,
    starting: number,
    interval: number
): SchedulePoint[] {
    const releaseAmount = totalAmount / BigInt(releases);
    const restAmount = totalAmount % BigInt(releases);
    const schedule = [];
    let timestamp = starting;
    for (let i = 0; i < releases - 1; i += 1) {
        schedule.push({
            amount: releaseAmount.toString(),
            timestamp: timestamp.toString(),
        });
        timestamp += interval;
    }
    schedule.push({
        amount: (releaseAmount + restAmount).toString(),
        timestamp: timestamp.toString(),
    });
    return schedule;
}

/**
 *  Constructs a, simple transfer, transaction object,
 * Given the fromAddress, toAddress and the amount.
 */
export async function createScheduledTransferTransaction(
    fromAddress: string,
    toAddress: string,
    schedule: SchedulePoint[],
    signatureAmount = 1,
    expiry: bigint = getDefaultExpiry()
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
        signatureAmount,
    });
}

/**
 *  Constructs an account credential update transaction,
 */
export async function createUpdateCredentialsTransaction(
    fromAddress: string,
    addedCredentials: AddedCredential[],
    removedCredIds: string[],
    threshold: number,
    currentCredentialAmount: number,
    signatureAmount = 1,
    expiry: bigint = getDefaultExpiry()
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
    signatureAmount = 1,
    expiry: bigint = getDefaultExpiry()
): Promise<AddBaker> {
    return createAccountTransaction({
        fromAddress,
        expiry,
        transactionKind: TransactionKindId.Add_baker,
        payload,
        signatureAmount,
    });
}

export function createUpdateBakerKeysTransaction(
    fromAddress: string,
    payload: UpdateBakerKeysPayload,
    signatureAmount = 1,
    expiry: bigint = getDefaultExpiry()
): Promise<UpdateBakerKeys> {
    return createAccountTransaction({
        fromAddress,
        expiry,
        transactionKind: TransactionKindId.Update_baker_keys,
        payload,
        signatureAmount,
    });
}

export function createRemoveBakerTransaction(
    fromAddress: string,
    signatureAmount = 1,
    expiry: bigint = getDefaultExpiry()
): Promise<RemoveBaker> {
    return createAccountTransaction({
        fromAddress,
        expiry,
        transactionKind: TransactionKindId.Remove_baker,
        payload: {},
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
    return (
        transaction.success === false ||
        transaction.status === TransactionStatus.Rejected
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

export function isSuccessfulTransaction(outcomes: TransactionEvent[]) {
    return outcomes.reduce(
        (accu, event) => accu && event.result.outcome === 'success',
        true
    );
}

export const isExpired = (transaction: Transaction) =>
    getTimeout(transaction) <= getNow(TimeStampUnit.seconds);

function amountAtDisposal(accountInfo: AccountInfo): bigint {
    const unShielded = BigInt(accountInfo.accountAmount);
    const stakedAmount = accountInfo.accountBaker
        ? BigInt(accountInfo.accountBaker.stakedAmount)
        : 0n;
    const scheduled = accountInfo.accountReleaseSchedule
        ? BigInt(accountInfo.accountReleaseSchedule.total)
        : 0n;
    return unShielded - scheduled - stakedAmount;
}

export function validateAmount(
    amountToValidate: string,
    accountInfo: AccountInfo | undefined,
    estimatedFee: bigint | undefined
): string | undefined {
    if (!isValidGTUString(amountToValidate)) {
        return 'Value is not a valid GTU amount';
    }
    if (
        accountInfo &&
        amountAtDisposal(accountInfo) <
            toMicroUnits(amountToValidate) + (estimatedFee || 0n)
    ) {
        return 'Insufficient funds';
    }
    if (toMicroUnits(amountToValidate) === 0n) {
        return 'Amount may not be zero';
    }
    return undefined;
}
