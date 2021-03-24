import {
    AccountTransaction,
    instanceOfScheduledTransfer,
    Schedule,
    TransactionKindId,
} from './types';
import { getEnergyToMicroGtuRate } from './nodeHelpers';

export const energyConstants = {
    SimpleTransferCost: 300n,
    EncryptedTransferCost: 27000n,
    TransferToEncryptedCost: 600n,
    TransferToPublicCost: 14850n,
    ScheduledTransferPerRelease: 300n + 64n,
};

export function getEnergyCostOfType(transactionKind: TransactionKindId) {
    switch (transactionKind) {
        case TransactionKindId.Transfer_with_schedule:
            return energyConstants.ScheduledTransferPerRelease * 255n;
        case TransactionKindId.Simple_transfer:
            return energyConstants.SimpleTransferCost;
        case TransactionKindId.Encrypted_transfer:
            return energyConstants.EncryptedTransferCost;
        case TransactionKindId.Transfer_to_encrypted:
            return energyConstants.TransferToEncryptedCost;
        case TransactionKindId.Transfer_to_public:
            return energyConstants.TransferToPublicCost;
        default:
            throw new Error(`Unsupported transaction type: ${transactionKind}`);
    }
}

export function getTransactionEnergyCost(transaction: AccountTransaction) {
    if (instanceOfScheduledTransfer(transaction)) {
        return (
            energyConstants.ScheduledTransferPerRelease *
            BigInt(transaction.payload.schedule.length)
        );
    }
    return getEnergyCostOfType(transaction.transactionKind);
}

export async function getTransactionKindCost(
    transactionKind: TransactionKindId
) {
    const energyToMicroGtu = await getEnergyToMicroGtuRate();
    return getEnergyCostOfType(transactionKind) * energyToMicroGtu;
}

export default async function getTransactionCost(
    transaction: AccountTransaction
) {
    const energyToMicroGtu = await getEnergyToMicroGtuRate();
    return getTransactionEnergyCost(transaction) * energyToMicroGtu;
}

export function getScheduledTransferEnergyCost(schedule: Schedule) {
    return (
        energyConstants.ScheduledTransferPerRelease * BigInt(schedule.length)
    );
}
