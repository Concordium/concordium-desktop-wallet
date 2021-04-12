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
} from './types';
import { getScheduledTransferAmount } from './transactionHelpers';
import getTransactionCost from './transactionCosts';
import { collapseFraction } from './basicHelpers';

/*
 * Converts the given transaction into the structure, which is used in the database.
 */
export function convertIncomingTransaction(
    transaction: IncomingTransaction,
    accountAddress: string
): TransferTransaction {
    let fromAddress = '';
    if (transaction.details.transferSource) {
        fromAddress = transaction.details.transferSource;
    } else if (
        transaction.origin.type === OriginType.Account &&
        transaction.origin.address
    ) {
        fromAddress = transaction.origin.address;
    } else if (transaction.origin.type === OriginType.Self) {
        fromAddress = accountAddress;
    }

    let toAddress = '';
    if (transaction.details.transferDestination) {
        toAddress = transaction.details.transferDestination;
    }
    let encrypted;
    if (transaction.encrypted) {
        encrypted = JSON.stringify(transaction.encrypted);
    }

    let { subtotal } = transaction;
    if (!subtotal) {
        subtotal = (
            BigInt(transaction.total) - BigInt(transaction.cost || '0')
        ).toString();
    }

    let decryptedAmount;
    if (
        transaction.details.type === TransactionKindString.TransferToEncrypted
    ) {
        let value = BigInt(subtotal);
        value = value > 0n ? value : -value;
        decryptedAmount = value.toString();
    }

    return {
        remote: true,
        originType: transaction.origin.type,
        transactionKind: transaction.details.type,
        id: transaction.id,
        blockHash: transaction.blockHash,
        blockTime: transaction.blockTime,
        total: transaction.total,
        success: transaction.details.outcome === 'success',
        transactionHash: transaction.transactionHash,
        subtotal,
        cost: transaction.cost,
        origin: JSON.stringify(transaction.origin),
        details: JSON.stringify(transaction.details),
        rejectReason: transaction.details.rejectReason,
        encrypted,
        decryptedAmount,
        fromAddress,
        toAddress,
        status: TransactionStatus.Finalized,
    };
}

// Return type for the functions for specific transaction types
type TypeSpecific = Pick<
    TransferTransaction,
    | 'transactionKind'
    | 'total'
    | 'subtotal'
    | 'schedule'
    | 'toAddress'
    | 'decryptedAmount'
>;

// Helper function for converting Account Transaction to TransferTransaction.
// Handles the fields of a simple transfer, which cannot be converted by the generic function .
function convertSimpleTransfer(
    transaction: SimpleTransfer,
    cost: bigint
): TypeSpecific {
    const amount = BigInt(transaction.payload.amount);
    const estimatedTotal = amount + cost;

    return {
        transactionKind: TransactionKindString.Transfer,
        total: (-estimatedTotal).toString(),
        subtotal: (-amount).toString(),
        toAddress: transaction.payload.toAddress,
    };
}

// Helper function for converting Account Transaction to TransferTransaction.
// Handles the fields of a transfer to encrypted, which cannot be converted by the generic function .
function convertTransferToEncrypted(
    transaction: TransferToEncrypted,
    cost: bigint
): TypeSpecific {
    const amount = BigInt(transaction.payload.amount);
    const estimatedTotal = amount + cost;

    return {
        transactionKind: TransactionKindString.TransferToEncrypted,
        total: (-estimatedTotal).toString(),
        subtotal: (-amount).toString(),
        decryptedAmount: amount.toString(),
        toAddress: transaction.sender,
    };
}

// Helper function for converting Account Transaction to TransferTransaction.
// Handles the fields of a transfer to public, which cannot be converted by the generic function .
function convertTransferToPublic(
    transaction: TransferToPublic,
    cost: bigint
): TypeSpecific {
    const amount = BigInt(transaction.payload.transferAmount);
    const estimatedTotal = amount - cost;

    return {
        transactionKind: TransactionKindString.TransferToPublic,
        total: estimatedTotal.toString(),
        subtotal: amount.toString(),
        decryptedAmount: (-amount).toString(),
        toAddress: transaction.sender,
    };
}

// Helper function for converting Account Transaction to TransferTransaction.
// Handles the fields of a scheduled transfer, which cannot be converted by the generic function .
function convertScheduledTransfer(
    transaction: ScheduledTransfer,
    cost: bigint
): TypeSpecific {
    const amount = getScheduledTransferAmount(transaction);
    const estimatedTotal = amount + cost;

    return {
        transactionKind: TransactionKindString.TransferWithSchedule,
        total: (-estimatedTotal).toString(),
        subtotal: (-amount).toString(),
        schedule: JSON.stringify(transaction.payload.schedule),
        toAddress: transaction.payload.toAddress,
    };
}

// Helper function for converting Account Transaction to TransferTransaction.
// Handles the fields of a encrypted transfer, which cannot be converted by the generic function .
function convertEncryptedTransfer(
    transaction: EncryptedTransfer,
    cost: bigint
): TypeSpecific {
    const amount = 0n;
    const estimatedTotal = amount + cost;

    return {
        transactionKind: TransactionKindString.EncryptedAmountTransfer,
        total: (-estimatedTotal).toString(),
        subtotal: (-amount).toString(),
        decryptedAmount: (-amount).toString(),
        toAddress: transaction.payload.toAddress,
    };
}

/**
 * Converts an Account Transaction, so that it fits local Transfer Transaction model and
 * can be entered into the local database.
 */
export async function convertAccountTransaction(
    transaction: AccountTransaction,
    hash: string
): Promise<TransferTransaction> {
    const cost = collapseFraction(
        transaction.estimatedFee || (await getTransactionCost(transaction))
    );

    let typeSpecific;
    if (instanceOfSimpleTransfer(transaction)) {
        typeSpecific = convertSimpleTransfer(transaction, cost);
    } else if (instanceOfScheduledTransfer(transaction)) {
        typeSpecific = convertScheduledTransfer(transaction, cost);
    } else if (instanceOfTransferToEncrypted(transaction)) {
        typeSpecific = convertTransferToEncrypted(transaction, cost);
    } else if (instanceOfTransferToPublic(transaction)) {
        typeSpecific = convertTransferToPublic(transaction, cost);
    } else if (instanceOfEncryptedTransfer(transaction)) {
        typeSpecific = convertEncryptedTransfer(transaction, cost);
    } else {
        throw new Error('unsupported transaction type - please implement');
    }

    return {
        blockHash: 'pending',
        remote: false,
        originType: OriginType.Self,
        transactionHash: hash,
        cost: cost.toString(),
        fromAddress: transaction.sender,
        blockTime: (Date.now() / 1000).toString(), // Temporary value, unless it fails
        status: TransactionStatus.Pending,
        ...typeSpecific,
    };
}
