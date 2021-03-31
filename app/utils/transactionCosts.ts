import {
    AccountTransaction,
    instanceOfScheduledTransfer,
    TransactionKindId,
    UpdateAccountCredentialsPayload,
} from './types';
import { getEnergyToMicroGtuRate } from './nodeHelpers';
import { serializeTransferPayload } from './transactionSerialization';

export const energyConstants = {
    SimpleTransferCost: 300n,
    EncryptedTransferCost: 27000n,
    TransferToEncryptedCost: 600n,
    TransferToPublicCost: 14850n,
    ScheduledTransferPerRelease: 300n + 64n,
    UpdateCredentialsBaseCost: 500n,
    UpdateCredentialsPerCredentialCost: 500n,
};

export const payloadSizeEstimate = {
    SimpleTransfer: 41,
    EncryptedTransfer: 2617,
    TransferToEncrypted: 9,
    TransferToPublic: 1405,
};

const constantA = 100n;
const constantB = 1n;
const transactionHeaderSize = BigInt(
    32 + // AccountAddress (FBS 32)
        8 + // Nonce (Word64)
        8 + // Energy (Word64)
        4 + // PayloadSize (Word32)
        8
); // TransactionExpiryTime (Word64)

function calculateCost(
    signatureAmount: bigint,
    payloadSize: bigint,
    transactionTypeCost: bigint
) {
    return (
        constantA * signatureAmount +
        constantB * (transactionHeaderSize + payloadSize) +
        transactionTypeCost
    );
}

function getPayloadSizeEstimate(transactionKind: TransactionKindId) {
    switch (transactionKind) {
        case TransactionKindId.Simple_transfer:
            return payloadSizeEstimate.SimpleTransfer;
        case TransactionKindId.Encrypted_transfer:
            return payloadSizeEstimate.EncryptedTransfer;
        case TransactionKindId.Transfer_to_encrypted:
            return payloadSizeEstimate.TransferToEncrypted;
        case TransactionKindId.Transfer_to_public:
            return payloadSizeEstimate.TransferToPublic;
        default:
            throw new Error(`Unsupported transaction type: ${transactionKind}`);
    }
}

function getEnergyCostOfType(transactionKind: TransactionKindId) {
    switch (transactionKind) {
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

export function getScheduledTransferEnergy(
    scheduleLength: number,
    signatureAmount = 1
) {
    const payloadSize = 32 + 1 + 1 + scheduleLength * 16;
    return calculateCost(
        BigInt(signatureAmount),
        BigInt(payloadSize),
        energyConstants.ScheduledTransferPerRelease * BigInt(scheduleLength)
    );
}

export function getTransactionEnergyCost(
    transaction: AccountTransaction,
    signatureAmount: number
) {
    const payloadSize = serializeTransferPayload(
        transaction.transactionKind,
        transaction.payload
    ).length;
    let transactionTypeCost;
    if (instanceOfScheduledTransfer(transaction)) {
        transactionTypeCost =
            energyConstants.ScheduledTransferPerRelease *
            BigInt(transaction.payload.schedule.length);
    } else {
        transactionTypeCost = getEnergyCostOfType(transaction.transactionKind);
    }
    return calculateCost(
        BigInt(signatureAmount),
        BigInt(payloadSize),
        transactionTypeCost
    );
}

export function getTransactionKindEnergy(
    transactionKind: TransactionKindId,
    payloadSize: number = getPayloadSizeEstimate(transactionKind),
    signatureAmount = 1
) {
    const transactionTypeCost = getEnergyCostOfType(transactionKind);
    return calculateCost(
        BigInt(signatureAmount),
        BigInt(payloadSize),
        transactionTypeCost
    );
}

export function getUpdateAccountCredentialEnergy(
    payload: UpdateAccountCredentialsPayload,
    currentCredentialAmount: number,
    signatureAmount = 1
) {
    const payloadSize = serializeTransferPayload(
        TransactionKindId.Update_credentials,
        payload
    ).length;
    return calculateCost(
        BigInt(signatureAmount),
        BigInt(payloadSize),
        energyConstants.UpdateCredentialsBaseCost +
            energyConstants.UpdateCredentialsPerCredentialCost *
                BigInt(
                    currentCredentialAmount + payload.addedCredentials.length
                )
    );
}

export async function getTransactionKindCost(
    transactionKind: TransactionKindId,
    payloadSize: number = getPayloadSizeEstimate(transactionKind),
    signatureAmount = 1
) {
    const energyToMicroGtu = await getEnergyToMicroGtuRate();
    return (
        getTransactionKindEnergy(
            transactionKind,
            payloadSize,
            signatureAmount
        ) * energyToMicroGtu
    );
}

export default async function getTransactionCost(
    transaction: AccountTransaction,
    signatureAmount = 1
) {
    const energyToMicroGtu = await getEnergyToMicroGtuRate();
    return (
        getTransactionEnergyCost(transaction, signatureAmount) *
        energyToMicroGtu
    );
}

export async function scheduledTransferCost(
    signatureAmount = 1
): Promise<(scheduleLength: number) => bigint> {
    const energyToMicroGtu = await getEnergyToMicroGtuRate();
    return (scheduleLength: number) => {
        return (
            getScheduledTransferEnergy(scheduleLength, signatureAmount) *
            energyToMicroGtu
        );
    };
}
