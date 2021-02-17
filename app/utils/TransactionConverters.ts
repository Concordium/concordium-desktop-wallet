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
} from './types';
import { getScheduledTransferAmount } from './transactionHelpers';

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
        subtotal: transaction.subtotal,
        cost: transaction.cost,
        origin: JSON.stringify(transaction.origin),
        details: JSON.stringify(transaction.details),
        encrypted,
        fromAddress,
        toAddress,
        status: TransactionStatus.Finalized,
    };
}

// Return type for the functions for specific transaction types
type TypeSpecific = Pick<
    TransferTransaction,
    'transactionKind' | 'total' | 'subtotal' | 'schedule'
>;

// Convert the type specific fields of a Simple transfer for an Account Transaction.
function convertSimpleTransfer(transaction: SimpleTransfer): TypeSpecific {
    const amount = BigInt(transaction.payload.amount);
    const estimatedTotal = amount + BigInt(transaction.energyAmount); // Fix this: convert from energy to cost

    return {
        transactionKind: TransactionKindString.Transfer,
        total: (-estimatedTotal).toString(),
        subtotal: (-amount).toString(),
    };
}

// Convert the type specific fields of a Scheduled transfer for an Account Transaction.
function convertScheduledTransfer(
    transaction: ScheduledTransfer
): TypeSpecific {
    const amount = getScheduledTransferAmount(transaction);
    const estimatedTotal = amount + BigInt(transaction.energyAmount); // Fix this: convert from energy to cost

    return {
        transactionKind: TransactionKindString.TransferWithSchedule,
        total: (-estimatedTotal).toString(),
        subtotal: (-amount).toString(),
        schedule: JSON.stringify(transaction.payload.schedule),
    };
}

/**
 * Converts an Account Transaction, so that it fits local Transfer Transaction model and
 * can be entered into the local database.
 */
export function convertAccountTransaction(
    transaction: AccountTransaction,
    hash: string
): TransferTransaction {
    let typeSpecific;
    if (instanceOfSimpleTransfer(transaction)) {
        typeSpecific = convertSimpleTransfer(transaction);
    } else if (instanceOfScheduledTransfer(transaction)) {
        typeSpecific = convertScheduledTransfer(transaction);
    } else {
        throw new Error('unsupported transaction type - please implement');
    }

    return {
        id: -1,
        blockHash: 'pending',
        remote: false,
        originType: OriginType.Self,
        transactionHash: hash,
        cost: transaction.energyAmount, // Fix this: convert from energy to cost
        fromAddress: transaction.sender,
        toAddress: transaction.payload.toAddress,
        blockTime: (Date.now() / 1000).toString(), // Temporary value, unless it fails
        status: TransactionStatus.Pending,
        ...typeSpecific,
    };
}
