import { AccountTransaction, TransactionKindId } from './types';

const constants = {
    SimpleTransferCost: 300,
    EncryptedTransferCost: 2700,
    TransferToEncryptedCost: 600,
    TransferToPublicCost: 14850,
    ScheduledTransferPerRelease: 300 + 64,
};

export default function getTransactionCost(transaction: AccountTransaction) {
    switch (transaction.transactionKind) {
        case TransactionKindId.Simple_transfer:
            return constants.SimpleTransferCost;
        case TransactionKindId.Encrypted_transfer:
            return constants.EncryptedTransferCost;
        case TransactionKindId.Transfer_to_encrypted:
            return constants.TransferToEncryptedCost;
        case TransactionKindId.Transfer_to_public:
            return constants.TransferToPublicCost;
        case TransactionKindId.Transfer_with_schedule:
            return (
                constants.ScheduledTransferPerRelease *
                transaction.payload.schedule.length
            );
        default:
            throw new Error(
                `Unsupported transaction type: ${transaction.transactionKind}`
            );
    }
}
