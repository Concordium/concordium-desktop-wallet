import {
    AccountTransaction,
    ConfigureBaker,
    Fraction,
    instanceOfConfigureBaker,
    instanceOfScheduledTransfer,
    instanceOfScheduledTransferWithMemo,
    TransactionKindId,
    UpdateAccountCredentialsPayload,
} from './types';
import { serializeTransferPayload } from './transactionSerialization';
import { getEncodedSize } from '~/utils/cborHelper';

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
    RegisterData: 300n,
    ConfigureBaker: 300n,
    ConfigureBakerWithKeys: 4050n,
    ConfigureDelegation: 300n,
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
    /**
     * TransactionKind (1 byte) + bitmap (2 bytes) + staked amount (8 bytes) + restake earnings (1 byte)
     * + open for delegation settings (1 byte) + metadata url (0 bytes, optional but max 2048 + 16 bytes) + 3 * commission rate (32 bytes)
     * + keys (160 bytes) + proofs (192 bytes)
     */
    ConfigureBakerFull: 1 + 2 + 8 + 1 + 1 + 3 * 32 + 0 + 160 + 192,
    ConfigureBakerStake: 1 + 2 + 8 + 1, // TransactionKind (1 byte) + bitmap (2 bytes) + staked amount (8 bytes) + restake earnings (1 byte)
    ConfigureBakerKeys: 1 + 2 + 160 + 192, // TransactionKind (1 byte) + bitmap (2 bytes) + keys (160 bytes) + proofs (192 bytes)
    ConfigureDelegationFull: 1 + 2 + 8 + 1 + 9, // TransactionKind (1 byte) + bitmap (2 bytes) + delegated amount (8 bytes) + restake earnings (1 byte) + delegation target (9 bytes)
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

/**
 *  Given a transactionKind, return the size of a payload of the particular kind.
 *  Note that this function does not support scheduled transfers nor transfers with memos, because their payload sizes are variable,
 *  and will cause the fucntion to throw an error.
 */
export function getPayloadSizeEstimate(
    transactionKind: TransactionKindId
): number {
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
        case TransactionKindId.Register_data:
            return energyConstants.RegisterData;
        case TransactionKindId.Configure_delegation:
            return energyConstants.ConfigureDelegation;
        default:
            throw new Error(`Unsupported transaction type: ${transactionKind}`);
    }
}

export function getScheduledTransferPayloadSize(
    scheduleLength: number,
    memoLength: number
) {
    return (
        // TransactionKind (Word8)
        1 +
        // Receiver Address (FBS 32)
        32 +
        // ScheduleLength (Word8)
        1 +
        // Amount (Word64) + Expiry (Word64)
        scheduleLength * 16 +
        // Memo
        (memoLength ? 2 + memoLength : 0)
    );
}

/**
 *  Given the signatureAmount and schedule length,
 * returns the energy cost of a scheduled transfer.
 * @param memoLength if memo length is 0, it is assumed that the transaction is a regular scheduled transfer.
 */
function getScheduledTransferEnergy(
    scheduleLength: number,
    signatureAmount: number,
    memoLength: number
): bigint {
    const payloadSize = getScheduledTransferPayloadSize(
        scheduleLength,
        memoLength
    );
    return calculateCost(
        BigInt(signatureAmount),
        BigInt(payloadSize),
        energyConstants.ScheduledTransferPerRelease * BigInt(scheduleLength)
    );
}

function getConfigureBakerEnergyCost({ payload }: ConfigureBaker) {
    return payload.keys !== undefined
        ? energyConstants.ConfigureBakerWithKeys
        : energyConstants.ConfigureBaker;
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
    if (
        instanceOfScheduledTransfer(transaction) ||
        instanceOfScheduledTransferWithMemo(transaction)
    ) {
        transactionTypeCost =
            energyConstants.ScheduledTransferPerRelease *
            BigInt(transaction.payload.schedule.length);
    } else if (instanceOfConfigureBaker(transaction)) {
        transactionTypeCost = getConfigureBakerEnergyCost(transaction);
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

export function getConfigureBakerCost(
    energyToMicroGtu: Fraction,
    payloadSize: number,
    withKeys: boolean,
    signatureAmount = 1
) {
    const energy = calculateCost(
        BigInt(signatureAmount),
        BigInt(payloadSize),
        withKeys
            ? energyConstants.ConfigureBakerWithKeys
            : energyConstants.ConfigureBaker
    );

    return energyToCost(energy, energyToMicroGtu);
}

export function getConfigureBakerKeysCost(
    energyToMicroGtu: Fraction,
    signatureAmount = 1,
    payloadSize = payloadSizeEstimate.ConfigureBakerKeys
) {
    const energy = calculateCost(
        BigInt(signatureAmount),
        BigInt(payloadSize),
        energyConstants.ConfigureBakerWithKeys
    );

    return energyToCost(energy, energyToMicroGtu);
}

export function getConfigureBakerStakeCost(
    energyToMicroGtu: Fraction,
    signatureAmount = 1,
    payloadSize = payloadSizeEstimate.ConfigureBakerStake
) {
    const energy = calculateCost(
        BigInt(signatureAmount),
        BigInt(payloadSize),
        energyConstants.ConfigureBaker
    );

    return energyToCost(energy, energyToMicroGtu);
}

export function getConfigureBakerFullCost(
    energyToMicroGtu: Fraction,
    signatureAmount = 1,
    payloadSize = payloadSizeEstimate.ConfigureBakerFull
) {
    const energy = calculateCost(
        BigInt(signatureAmount),
        BigInt(payloadSize),
        energyConstants.ConfigureBakerWithKeys
    );

    return energyToCost(energy, energyToMicroGtu);
}

/**
 *  Given the signatureAmount and payloadSize, returns the estimated MicroCCD cost of the transaction type.
 */
export function getTransactionKindCost(
    transactionKind: TransactionKindId,
    energyToMicroGtu: Fraction,
    signatureAmount = 1,
    memo?: string,
    payloadSize: number = getPayloadSizeEstimate(transactionKind)
): Fraction {
    const memoSize = memo ? 2 + getEncodedSize(memo) : 0;
    const energy = getTransactionKindEnergy(
        transactionKind,
        payloadSize + memoSize,
        signatureAmount
    );
    return energyToCost(energy, energyToMicroGtu);
}

/**
 *  Given the signatureAmount and a transaction returns
 * the estimated MicroCCD cost of the transaction.
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
 * will return the estimated MicroCCD cost of a scheduled transfer.
 */
export function scheduledTransferCost(
    energyToMicroGtu: Fraction,
    scheduleLength: number,
    signatureAmount = 1,
    memo?: string
): Fraction {
    const energy = getScheduledTransferEnergy(
        scheduleLength,
        signatureAmount,
        getEncodedSize(memo)
    );
    return energyToCost(energy, energyToMicroGtu);
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
