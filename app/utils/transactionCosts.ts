import {
    AccountTransaction,
    instanceOfScheduledTransfer,
    Schedule,
    TransactionKindId,
} from './types';

export const energyConstants = {
    SimpleTransferCost: 300n,
    EncryptedTransferCost: 27000n,
    TransferToEncryptedCost: 600n,
    TransferToPublicCost: 14850n,
    ScheduledTransferPerRelease: 300n + 64n,
};

export function getTransactionEnergyCost(transaction: AccountTransaction) {
    if (instanceOfScheduledTransfer(transaction)) {
        return (
            energyConstants.ScheduledTransferPerRelease *
            BigInt(transaction.payload.schedule.length)
        );
    }
    switch (transaction.transactionKind) {
        case TransactionKindId.Simple_transfer:
            return energyConstants.SimpleTransferCost;
        case TransactionKindId.Encrypted_transfer:
            return energyConstants.EncryptedTransferCost;
        case TransactionKindId.Transfer_to_encrypted:
            return energyConstants.TransferToEncryptedCost;
        case TransactionKindId.Transfer_to_public:
            return energyConstants.TransferToPublicCost;
        default:
            throw new Error(
                `Unsupported transaction type: ${transaction.transactionKind}`
            );
    }
}

export default function getTransactionCost(
    transaction: AccountTransaction,
    energyToMicroGtu = 100n
) {
    return getTransactionEnergyCost(transaction) * energyToMicroGtu;
}

export function getScheduledTransferEnergyCost(schedule: Schedule) {
    return (
        energyConstants.ScheduledTransferPerRelease * BigInt(schedule.length)
    );
}
