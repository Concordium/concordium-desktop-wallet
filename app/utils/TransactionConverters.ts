import {
    TransferTransaction,
    TransactionStatus,
    TransactionKindString,
    OriginType,
    AccountTransaction,
    IncomingTransaction,
    SimpleTransfer,
    instanceOfSimpleTransfer,
    ScheduledTransfer,
    instanceOfScheduledTransfer,
    TransferToEncrypted,
    instanceOfTransferToEncrypted,
    instanceOfTransferToPublic,
    TransferToPublic,
    instanceOfEncryptedTransfer,
    EncryptedTransfer,
    instanceOfSimpleTransferWithMemo,
    SimpleTransferWithMemo,
    ScheduledTransferWithMemo,
    EncryptedTransferWithMemo,
    instanceOfScheduledTransferWithMemo,
    instanceOfEncryptedTransferWithMemo,
    instanceOfAddBaker,
    instanceOfRemoveBaker,
    instanceOfUpdateBakerStake,
    instanceOfUpdateBakerKeys,
    instanceOfUpdateBakerRestakeEarnings,
    instanceOfConfigureBaker,
    instanceOfConfigureDelegation,
} from './types';
import { getScheduledTransferAmount } from './transactionHelpers';
import { collapseFraction, abs } from './basicHelpers';
import { stringify } from './JSONHelper';
import { decodeCBOR } from './cborHelper';

function getDataBlob(raw: string) {
    // The dataBlob from the proxy is a "hex-encoded byte array".
    try {
        const dataBlob = decodeCBOR(raw);
        if (typeof dataBlob === 'object') {
            return JSON.stringify(dataBlob);
        }
        return dataBlob.toString();
    } catch {
        return raw;
    }
}

/*
 * Converts the given transaction into the structure, which is used in the database.
 */
export function convertIncomingTransaction(
    transaction: IncomingTransaction,
    accountAddress: string
): TransferTransaction {
    const transactionKind = transaction.details.type;
    const originType = transaction.origin.type;

    let fromAddress = '';
    if (transaction.details.transferSource) {
        fromAddress = transaction.details.transferSource;
    } else if (
        originType === OriginType.Account &&
        transaction.origin.address
    ) {
        fromAddress = transaction.origin.address;
    } else if (originType === OriginType.Self) {
        fromAddress = accountAddress;
    }

    let toAddress = '';
    if (transaction.details.transferDestination) {
        toAddress = transaction.details.transferDestination;
    } else if (transaction.origin.type === OriginType.Reward) {
        toAddress = accountAddress;
    }
    let encrypted;
    if (transaction.encrypted) {
        const { inputEncryptedAmount } = transaction.details;
        encrypted = JSON.stringify({
            ...transaction.encrypted,
            inputEncryptedAmount,
        });
    }

    const success = transaction.details.outcome === 'success';

    let { subtotal } = transaction;

    if (!success) {
        subtotal = subtotal || '0';
    } else if (!subtotal) {
        subtotal = (
            abs(BigInt(transaction.total)) -
            abs(BigInt(transaction.cost || '0'))
        ).toString();
    }
    if (BigInt(subtotal) < 0n) {
        subtotal = (-BigInt(subtotal)).toString();
    }

    let decryptedAmount;
    if (
        [
            TransactionKindString.TransferToEncrypted,
            TransactionKindString.TransferToPublic,
        ].includes(transactionKind)
    ) {
        // The subtotal is always non-negative;
        const value = BigInt(subtotal);
        if (transactionKind === TransactionKindString.TransferToEncrypted) {
            // transfer to encrypted increases the decryptedAmount;
            decryptedAmount = value.toString();
        }
        if (transactionKind === TransactionKindString.TransferToPublic) {
            // transfer to encrypted decreases the decryptedAmount;
            decryptedAmount = (-value).toString();
        }
    }

    const status = success
        ? TransactionStatus.Finalized
        : TransactionStatus.Failed;

    let dataBlob;
    if (transaction.details.memo) {
        dataBlob = getDataBlob(transaction.details.memo);
    } else if (transaction.details.registeredData) {
        dataBlob = getDataBlob(transaction.details.registeredData);
    }

    return {
        transactionKind,
        id: transaction.id,
        blockHash: transaction.blockHash,
        blockTime: transaction.blockTime,
        transactionHash: transaction.transactionHash,
        subtotal,
        cost: transaction.cost,
        encrypted,
        decryptedAmount,
        fromAddress,
        toAddress,
        rejectReason: transaction.details.rawRejectReason?.tag,
        status,
        events: transaction.details.events,
        memo: dataBlob,
    };
}

// Return type for the functions for specific transaction types
type TypeSpecific = Pick<
    TransferTransaction,
    | 'transactionKind'
    | 'subtotal'
    | 'schedule'
    | 'toAddress'
    | 'decryptedAmount'
    | 'encrypted'
    | 'memo'
>;

// Helper function for converting Account Transaction to TransferTransaction.
// Handles the fields of a simple transfer, which cannot be converted by the generic function .
function convertSimpleTransfer(transaction: SimpleTransfer): TypeSpecific {
    const amount = BigInt(transaction.payload.amount);

    return {
        transactionKind: TransactionKindString.Transfer,
        subtotal: amount.toString(),
        toAddress: transaction.payload.toAddress,
    };
}

// Helper function for converting Account Transaction to TransferTransaction.
// Handles the fields of a simple transfer with memo, which cannot be converted by the generic function .
function convertSimpleTransferWithMemo(
    transaction: SimpleTransferWithMemo
): TypeSpecific {
    return {
        ...convertSimpleTransfer(transaction),
        transactionKind: TransactionKindString.TransferWithMemo,
        memo: transaction.payload.memo,
    };
}

// Helper function for converting Account Transaction to TransferTransaction.
// Handles the fields of a transfer to encrypted, which cannot be converted by the generic function .
function convertTransferToEncrypted(
    transaction: TransferToEncrypted
): TypeSpecific {
    const amount = BigInt(transaction.payload.amount);

    const {
        newSelfEncryptedAmount,
        remainingDecryptedAmount,
    } = transaction.payload;
    if (!newSelfEncryptedAmount || !remainingDecryptedAmount) {
        throw new Error('Unexpected missing remaining amount');
    }
    const encrypted = stringify({
        newSelfEncryptedAmount,
        remainingDecryptedAmount,
    });

    return {
        transactionKind: TransactionKindString.TransferToEncrypted,
        subtotal: amount.toString(),
        decryptedAmount: amount.toString(),
        toAddress: transaction.sender,
        encrypted,
    };
}

// Helper function for converting Account Transaction to TransferTransaction.
// Handles the fields of a transfer to public, which cannot be converted by the generic function .
function convertTransferToPublic(transaction: TransferToPublic): TypeSpecific {
    const amount = BigInt(transaction.payload.transferAmount);

    const {
        remainingEncryptedAmount,
        remainingDecryptedAmount,
    } = transaction.payload;
    if (!remainingEncryptedAmount || !remainingDecryptedAmount) {
        throw new Error('Unexpected missing remaining amount');
    }
    const encrypted = stringify({
        newSelfEncryptedAmount: remainingEncryptedAmount,
        remainingDecryptedAmount,
    });

    return {
        transactionKind: TransactionKindString.TransferToPublic,
        subtotal: amount.toString(),
        decryptedAmount: (-amount).toString(),
        toAddress: transaction.sender,
        encrypted,
    };
}

// Helper function for converting Account Transaction to TransferTransaction.
// Handles the fields of a scheduled transfer, which cannot be converted by the generic function .
function convertScheduledTransfer(
    transaction: ScheduledTransfer
): TypeSpecific {
    const amount = getScheduledTransferAmount(transaction);

    return {
        transactionKind: TransactionKindString.TransferWithSchedule,
        subtotal: amount.toString(),
        schedule: JSON.stringify(transaction.payload.schedule),
        toAddress: transaction.payload.toAddress,
    };
}

// Helper function for converting Account Transaction to TransferTransaction.
// Handles the fields of a simple transfer with memo, which cannot be converted by the generic function .
function convertScheduledTransferWithMemo(
    transaction: ScheduledTransferWithMemo
): TypeSpecific {
    return {
        ...convertScheduledTransfer(transaction),
        transactionKind: TransactionKindString.TransferWithScheduleAndMemo,
        memo: transaction.payload.memo,
    };
}

// Helper function for converting Account Transaction to TransferTransaction.
// Handles the fields of a encrypted transfer, which cannot be converted by the generic function .
function convertEncryptedTransfer(
    transaction: EncryptedTransfer
): TypeSpecific {
    const amount = transaction.payload.plainTransferAmount;

    const {
        remainingEncryptedAmount,
        remainingDecryptedAmount,
    } = transaction.payload;
    if (!remainingEncryptedAmount || !remainingDecryptedAmount) {
        throw new Error('Unexpected missing remaining amount');
    }
    const encrypted = stringify({
        newSelfEncryptedAmount: remainingEncryptedAmount,
        remainingDecryptedAmount,
    });
    return {
        transactionKind: TransactionKindString.EncryptedAmountTransfer,
        subtotal: '0',
        decryptedAmount: amount.toString(),
        toAddress: transaction.payload.toAddress,
        encrypted,
    };
}

// Helper function for converting Account Transaction to TransferTransaction.
// Handles the fields of a simple transfer with memo, which cannot be converted by the generic function .
function convertEncryptedTransferWithMemo(
    transaction: EncryptedTransferWithMemo
): TypeSpecific {
    return {
        ...convertEncryptedTransfer(transaction),
        transactionKind: TransactionKindString.EncryptedAmountTransferWithMemo,
        memo: transaction.payload.memo,
    };
}

function getBaseTransaction(
    transactionKind: TransactionKindString
): TypeSpecific {
    return { transactionKind, subtotal: '0', toAddress: '' };
}

/**
 * Converts an Account Transaction, so that it fits local Transfer Transaction model and
 * can be entered into the local database.
 */
export async function convertAccountTransaction(
    transaction: AccountTransaction,
    hash: string
): Promise<TransferTransaction> {
    if (!transaction.estimatedFee) {
        throw new Error('unexpected estimated fee');
    }

    const cost = collapseFraction(transaction.estimatedFee);

    let typeSpecific;
    if (instanceOfSimpleTransfer(transaction)) {
        typeSpecific = convertSimpleTransfer(transaction);
    } else if (instanceOfSimpleTransferWithMemo(transaction)) {
        typeSpecific = convertSimpleTransferWithMemo(transaction);
    } else if (instanceOfScheduledTransfer(transaction)) {
        typeSpecific = convertScheduledTransfer(transaction);
    } else if (instanceOfScheduledTransferWithMemo(transaction)) {
        typeSpecific = convertScheduledTransferWithMemo(transaction);
    } else if (instanceOfTransferToEncrypted(transaction)) {
        typeSpecific = convertTransferToEncrypted(transaction);
    } else if (instanceOfTransferToPublic(transaction)) {
        typeSpecific = convertTransferToPublic(transaction);
    } else if (instanceOfEncryptedTransfer(transaction)) {
        typeSpecific = convertEncryptedTransfer(transaction);
    } else if (instanceOfEncryptedTransferWithMemo(transaction)) {
        typeSpecific = convertEncryptedTransferWithMemo(transaction);
    } else if (instanceOfAddBaker(transaction)) {
        typeSpecific = getBaseTransaction(TransactionKindString.AddBaker);
    } else if (instanceOfRemoveBaker(transaction)) {
        typeSpecific = getBaseTransaction(TransactionKindString.RemoveBaker);
    } else if (instanceOfUpdateBakerStake(transaction)) {
        typeSpecific = getBaseTransaction(
            TransactionKindString.UpdateBakerStake
        );
    } else if (instanceOfUpdateBakerKeys(transaction)) {
        typeSpecific = getBaseTransaction(
            TransactionKindString.UpdateBakerKeys
        );
    } else if (instanceOfUpdateBakerRestakeEarnings(transaction)) {
        typeSpecific = getBaseTransaction(
            TransactionKindString.UpdateBakerRestakeEarnings
        );
    } else if (instanceOfConfigureBaker(transaction)) {
        typeSpecific = getBaseTransaction(TransactionKindString.ConfigureBaker);
    } else if (instanceOfConfigureDelegation(transaction)) {
        typeSpecific = getBaseTransaction(
            TransactionKindString.ConfigureDelegation
        );
    } else {
        throw new Error('unsupported transaction type - please implement');
    }

    return {
        blockHash: '',
        transactionHash: hash,
        cost: cost.toString(),
        fromAddress: transaction.sender,
        blockTime: (Date.now() / 1000).toString(), // Temporary value, unless it fails
        status: TransactionStatus.Pending,
        ...typeSpecific,
    };
}
