import {
    AccountTransaction,
    Fraction,
    instanceOfScheduledTransfer,
    TransactionKindId,
    UpdateAccountCredentialsPayload,
} from './types';
import { serializeTransferPayload } from './transactionSerialization';

/**
 * These constants should be kept consistent with:
 * https://github.com/Concordium/concordium-base/blob/main/haskell-src/Concordium/Cost.hs
 */
export const energyConstants = {
    SimpleTransferCost: 300n,
    EncryptedTransferCost: 27000n,
    TransferToEncryptedCost: 600n,
    TransferToPublicCost: 14850n,
    ScheduledTransferPerRelease: 300n + 64n,
    UpdateCredentialsBaseCost: 500n,
    UpdateCredentialsCostPerCurrentCredential: 500n,
    UpdateCredentialsCostPerNewCredential: 54000n + 100n * 1n, // TODO: remove assumption that a credential has 1 key.
    AddBaker: 4050n,
    UpdateBakerKeys: 4050n,
    RemoveBaker: 300n,
    UpdateBakerStake: 300n,
    UpdateBakerRestakeEarnings: 300n,
};

/**
 * Payload sizes of different transaction types.
 * Should be updated in case the transactions'
 * format changes.
 */
export const payloadSizeEstimate = {
    SimpleTransfer: 41, // AccountAddress (FBS 32) + Amount (Word64) + TransactionKind (Word8)
    EncryptedTransfer: 2617, // AccountAddress (FBS 32) + EncryptedRemainingAmount (192 bytes) + TransactionKind (Word8) + EncryptedTransferAmount (192 bytes) + index (Word64) + Proofs (Assumed 2192 bytes)
    TransferToEncrypted: 9, // Amount (Word64) + TransactionKind (Word8)
    TransferToPublic: 1405, // Amount (Word64) + TransactionKind (Word8) + EncryptedAmount (192 bytes) + index (Word64) + Proofs (Assumed 1189 bytes)
    AddBaker: 362, // TransactionKind (Word8) + keys (160 bytes) + proofs(192 bytes) + stakedAmount (8 bytes) + restake_earnings (1 byte)
    UpdateBakerKeys: 353, // TransactionKind (Word8) + keys (160 bytes) + proofs(192 bytes)
    RemoveBaker: 1, // TransactionKind (Word8)
    UpdateBakerStake: 1 + 8, // TransactionKind (Word8) + staked amount (8 bytes)
    UpdateBakerRestakeEarnings: 1 + 1, // TransactionKind (Word8) + restake earnings (1 byte)
};

/**
 * These constants should be kept consistent with constA and constB in:
 * https://github.com/Concordium/concordium-base/blob/main/haskell-src/Concordium/Cost.hs
 */
export const constantA = 100n;
export const constantB = 1n;

export const transactionHeaderSize = BigInt(
    32 + // AccountAddress (FBS 32)
        8 + // Nonce (Word64)
        8 + // Energy (Word64)
        4 + // PayloadSize (Word32)
        8 // TransactionExpiryTime (Word64)
);

/**
 * This function should be kept consistent with baseCost in:
 * https://github.com/Concordium/concordium-base/blob/main/haskell-src/Concordium/Cost.hs
 */
export function calculateCost(
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

export function getPayloadSizeEstimate(transactionKind: TransactionKindId) {
    switch (transactionKind) {
        case TransactionKindId.Simple_transfer:
            return payloadSizeEstimate.SimpleTransfer;
        case TransactionKindId.Encrypted_transfer:
            return payloadSizeEstimate.EncryptedTransfer;
        case TransactionKindId.Transfer_to_encrypted:
            return payloadSizeEstimate.TransferToEncrypted;
        case TransactionKindId.Transfer_to_public:
            return payloadSizeEstimate.TransferToPublic;
        case TransactionKindId.Add_baker:
            return payloadSizeEstimate.AddBaker;
        case TransactionKindId.Update_baker_keys:
            return payloadSizeEstimate.UpdateBakerKeys;
        case TransactionKindId.Remove_baker:
            return payloadSizeEstimate.RemoveBaker;
        case TransactionKindId.Update_baker_stake:
            return payloadSizeEstimate.UpdateBakerStake;
        case TransactionKindId.Update_baker_restake_earnings:
            return payloadSizeEstimate.UpdateBakerRestakeEarnings;
        default:
            throw new Error(`Unsupported transaction type: ${transactionKind}`);
    }
}

function getEnergyCostOfType(transactionKind: TransactionKindId) {
    switch (transactionKind) {
        case TransactionKindId.Simple_transfer:
        case TransactionKindId.Simple_transfer_with_memo:
            return energyConstants.SimpleTransferCost;
        case TransactionKindId.Encrypted_transfer:
        case TransactionKindId.Encrypted_transfer_with_memo:
            return energyConstants.EncryptedTransferCost;
        case TransactionKindId.Transfer_to_encrypted:
            return energyConstants.TransferToEncryptedCost;
        case TransactionKindId.Transfer_to_public:
            return energyConstants.TransferToPublicCost;
        case TransactionKindId.Add_baker:
            return energyConstants.AddBaker;
        case TransactionKindId.Update_baker_keys:
            return energyConstants.UpdateBakerKeys;
        case TransactionKindId.Remove_baker:
            return energyConstants.RemoveBaker;
        case TransactionKindId.Update_baker_stake:
            return energyConstants.UpdateBakerStake;
        case TransactionKindId.Update_baker_restake_earnings:
            return energyConstants.UpdateBakerRestakeEarnings;
        default:
            throw new Error(`Unsupported transaction type: ${transactionKind}`);
    }
}

export function getScheduledTransferPayloadSize(scheduleLength: number) {
    return (
        1 + // TransactionKind (Word8)
        32 + // Receiver Address (FBS 32)
        1 + // ScheduleLength (Word8)
        scheduleLength * 16
    ); // Amount (Word64) + Expiry (Word64)
}

/**
 *  Given the signatureAmount and schedule length,
 * returns the energy cost of a scheduled transfer.
 */
function getScheduledTransferEnergy(
    scheduleLength: number,
    signatureAmount = 1
): bigint {
    const payloadSize = getScheduledTransferPayloadSize(scheduleLength);
    return calculateCost(
        BigInt(signatureAmount),
        BigInt(payloadSize),
        energyConstants.ScheduledTransferPerRelease * BigInt(scheduleLength)
    );
}

/**
 *  Given the signatureAmount and a transaction returns
 * the energy cost of the transaction.
 */
export function getTransactionEnergyCost(
    transaction: AccountTransaction,
    signatureAmount = 1
): bigint {
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

/**
 *  Given the signatureAmount and payloadSize, returns the energy cost of the transaction type.
 */
export function getTransactionKindEnergy(
    transactionKind: TransactionKindId,
    payloadSize: number = getPayloadSizeEstimate(transactionKind),
    signatureAmount = 1
): bigint {
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

    const newCredentialAmount = BigInt(payload.addedCredentials.length);

    const variableCost =
        energyConstants.UpdateCredentialsCostPerNewCredential *
            newCredentialAmount +
        energyConstants.UpdateCredentialsCostPerCurrentCredential *
            BigInt(currentCredentialAmount);

    return calculateCost(
        BigInt(signatureAmount),
        BigInt(payloadSize),
        energyConstants.UpdateCredentialsBaseCost + variableCost
    );
}

function energyToCost(energy: bigint, exchangeRate: Fraction): Fraction {
    return {
        numerator: energy * exchangeRate.numerator,
        denominator: exchangeRate.denominator,
    };
}

/**
 *  Given the signatureAmount and payloadSize, returns the estimated MicroGTU cost of the transaction type.
 */
export function getTransactionKindCost(
    transactionKind: TransactionKindId,
    energyToMicroGtu: Fraction,
    signatureAmount = 1,
    payloadSize: number = getPayloadSizeEstimate(transactionKind)
): Fraction {
    const energy = getTransactionKindEnergy(
        transactionKind,
        payloadSize,
        signatureAmount
    );
    return energyToCost(energy, energyToMicroGtu);
}

/**
 *  Given the signatureAmount and a transaction returns
 * the estimated MicroGTU cost of the transaction.
 */
export default function getTransactionCost(
    transaction: AccountTransaction,
    energyToMicroGtu: Fraction,
    signatureAmount = 1
): Fraction {
    const energy = getTransactionEnergyCost(transaction, signatureAmount);
    return energyToCost(energy, energyToMicroGtu);
}

/**
 *  Given the signatureAmount returns a function, which given the current schedule length,
 * will return the estimated MicroGTU cost of a scheduled transfer.
 */
export function scheduledTransferCost(
    energyToMicroGtu: Fraction,
    signatureAmount = 1
): (scheduleLength: number) => Fraction {
    return (scheduleLength: number) => {
        const energy = getScheduledTransferEnergy(
            scheduleLength,
            signatureAmount
        );
        return energyToCost(energy, energyToMicroGtu);
    };
}

export function getUpdateCredentialsCost(
    energyToMicroGtu: Fraction,
    payload: UpdateAccountCredentialsPayload,
    currentCredentialAmount: number,
    signatureAmount = 1
): Fraction {
    const energy = getUpdateAccountCredentialEnergy(
        payload,
        currentCredentialAmount,
        signatureAmount
    );
    return energyToCost(energy, energyToMicroGtu);
}
