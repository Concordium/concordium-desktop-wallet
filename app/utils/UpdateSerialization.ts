import { Buffer } from 'buffer/';
import { ValidatorScoreParameters } from '@concordium/web-sdk';
import { CreatePLTPayload } from '@concordium/web-sdk/plt';
import {
    encodeWord32,
    encodeWord64,
    putBase58Check,
    serializeVerifyKey,
    serializeIpInfo,
    serializeArInfo,
    encodeWord8,
} from './serializationHelpers';
import {
    BakerStakeThreshold,
    BlockItemKind,
    ElectionDifficulty,
    ExchangeRate,
    FoundationAccount,
    GasRewards,
    HigherLevelKeyUpdate,
    MintDistribution,
    ProtocolUpdate,
    TransactionFeeDistribution,
    UpdateHeader,
    UpdateInstruction,
    UpdateInstructionPayload,
    UpdateType,
    UpdateInstructionSignatureWithIndex,
    AuthorizationKeysUpdate,
    AccessStructure,
    AddAnonymityRevoker,
    AddIdentityProvider,
    SerializedTextWithLength,
    TimeParameters,
    CooldownParameters,
    PoolParameters,
    CommissionRates,
    CommissionRanges,
    AuthorizationKeysUpdateType,
    BlockEnergyLimit,
    FinalizationCommitteeParameters,
    MinBlockTime,
    TimeoutParameters,
} from './types';

/**
 * Update type enumeration. The numbering/order is important as it corresponds
 * to the byte written when serializing the update instruction. Therefore it is
 * important that it matches the chain serialization values.
 */
export enum OnChainUpdateType {
    UpdateProtocol = 1,
    UpdateElectionDifficulty = 2,
    UpdateEuroPerEnergy = 3,
    UpdateMicroGTUPerEuro = 4,
    UpdateFoundationAccount = 5,
    UpdateMintDistribution = 6,
    UpdateTransactionFeeDistribution = 7,
    UpdateGASRewards = 8,
    UpdateBakerStakeThreshold = 9,
    UpdateRootKeys = 10,
    UpdateLevel1Keys = 11,
    // eslint-disable-next-line no-shadow
    AddAnonymityRevoker = 12,
    // eslint-disable-next-line no-shadow
    AddIdentityProvider = 13,
    // eslint-disable-next-line no-shadow
    UpdateCooldownParameters = 14,
    UpdatePoolParameters = 15,
    UpdateTimeParameters = 16,
    UpdateMintDistributionV1 = 17,
    UpdateTimeoutParameters = 18,
    UpdateMinBlockTime = 19,
    UpdateBlockEnergyLimit = 20,
    UpdateGASRewardsV1 = 21,
    UpdateFinalizationCommitteeParameters = 22,
    UpdateValidatorScoreParameters = 23,
    UpdateCreatePltParameters = 24,
}

/**
 * Interface for the serialization of a protocol update split into its
 * different parts required to correctly stream it in parts to the Ledger.
 */
export interface SerializedProtocolUpdate {
    serialization: Buffer;
    payloadLength: Buffer;
    message: SerializedTextWithLength;
    specificationUrl: SerializedTextWithLength;
    transactionHash: Buffer;
    auxiliaryData: Buffer;
}

function serializeAccessStructure(accessStructure: AccessStructure) {
    const seralizedAccessStructure = Buffer.alloc(2);
    seralizedAccessStructure.writeUInt16BE(
        accessStructure.publicKeyIndicies.length,
        0
    );

    // The indices must be sorted in ascending order to ensure that the serialization
    // is unique.
    const sortedIndicies = accessStructure.publicKeyIndicies.sort(
        (index1, index2) => {
            return index1.index - index2.index;
        }
    );
    const serializedIndicies = Buffer.concat(
        sortedIndicies.map((index) => {
            const serializedIndex = Buffer.alloc(2);
            serializedIndex.writeUInt16BE(index.index, 0);
            return serializedIndex;
        })
    );

    const threshold = Buffer.alloc(2);
    threshold.writeUInt16BE(accessStructure.threshold, 0);

    return Buffer.concat([
        seralizedAccessStructure,
        serializedIndicies,
        threshold,
    ]);
}

/**
 * Takes an AuthorizationKeysUpdateType and gives the value it should be serialized as.
 */
export function convertAuthorizationKeyUpdateType(
    type: AuthorizationKeysUpdateType
): number {
    switch (type) {
        case AuthorizationKeysUpdateType.Level1V0:
            return 1;
        case AuthorizationKeysUpdateType.Level1V1:
            return 2;
        case AuthorizationKeysUpdateType.RootV0:
            return 2;
        case AuthorizationKeysUpdateType.RootV1:
            return 3;
        default:
            throw new Error('Unknown authorization key update type');
    }
}

/**
 * Serializes an AuthorizationKeysUpdate to the byte format
 * expected by the chain.
 */
export function serializeAuthorizationKeysUpdate(
    authorizationKeysUpdate: AuthorizationKeysUpdate
) {
    const serializedAuthorizationKeysUpdate = Buffer.alloc(3);
    serializedAuthorizationKeysUpdate.writeInt8(
        convertAuthorizationKeyUpdateType(
            authorizationKeysUpdate.keyUpdateType
        ),
        0
    );
    serializedAuthorizationKeysUpdate.writeUInt16BE(
        authorizationKeysUpdate.keys.length,
        1
    );

    const serializedKeys = Buffer.concat(
        authorizationKeysUpdate.keys.map(serializeVerifyKey)
    );

    const serializedAccessStructures: Buffer = Buffer.concat(
        authorizationKeysUpdate.accessStructures.map(serializeAccessStructure)
    );

    return Buffer.concat([
        serializedAuthorizationKeysUpdate,
        serializedKeys,
        serializedAccessStructures,
    ]);
}

/**
 * Serializes a HigherLevelKeyUpdate to the byte format
 * expected by the chain.
 */
export function serializeHigherLevelKeyUpdate(
    higherLevelKeyUpdate: HigherLevelKeyUpdate
) {
    const serializedHigherLevelKeyUpdate = Buffer.alloc(3);
    serializedHigherLevelKeyUpdate.writeInt8(
        higherLevelKeyUpdate.keyUpdateType,
        0
    );
    serializedHigherLevelKeyUpdate.writeUInt16BE(
        higherLevelKeyUpdate.updateKeys.length,
        1
    );

    const serializedKeys = Buffer.concat(
        higherLevelKeyUpdate.updateKeys.map((updateKey) =>
            serializeVerifyKey(updateKey.key)
        )
    );

    const threshold = Buffer.alloc(2);
    threshold.writeUInt16BE(higherLevelKeyUpdate.threshold, 0);

    return Buffer.concat([
        serializedHigherLevelKeyUpdate,
        serializedKeys,
        threshold,
    ]);
}

/**
 * Serializes a BakerStakeThreshold to the byte format expected
 * by the chain.
 */
export function serializeBakerStakeThreshold(
    bakerStakeThreshold: BakerStakeThreshold
) {
    const serializedBakerStakeThreshold = encodeWord64(
        BigInt(bakerStakeThreshold.threshold)
    );
    return serializedBakerStakeThreshold;
}

/**
 * Serializes a BlockEnergyLimit to the byte format expected
 * by the chain.
 */
export function serializeBlockEnergyLimit(blockEnergyLimit: BlockEnergyLimit) {
    const serializedBlockEnergyLimit = encodeWord64(
        BigInt(blockEnergyLimit.blockEnergyLimit)
    );
    return serializedBlockEnergyLimit;
}

/**
 * Serializes a FinalizationCommitteeParameters to the byte format expected
 * by the chain.
 */
export function serializeFinalizationCommitteeParameters(
    finalizationCommitteeParameters: FinalizationCommitteeParameters
) {
    return Buffer.concat([
        encodeWord32(finalizationCommitteeParameters.minFinalizers),
        encodeWord32(finalizationCommitteeParameters.maxFinalizers),
        encodeWord32(
            finalizationCommitteeParameters.relativeStakeThresholdFraction
        ),
    ]);
}

/**
 * Serializes a ValidatorScore update to the byte format expected
 * by the chain.
 */
export function serializeValidatorScoreParameters(
    parameters: ValidatorScoreParameters
) {
    return encodeWord64(parameters.maxMissedRounds);
}

/**
 * Serializes a Create PLT update parameter to the byte format expected
 * by the chain.
 */
export function serializeCreatePltParameters(
    parameters: CreatePLTPayload
) {
    let tokenId = parameters.tokenId.value
    const tokenIdBytes = Buffer.from(new TextEncoder().encode(tokenId));
    if (tokenIdBytes.length > 128) {
        throw new Error(`The token id length was greater than 128 bytes. Current length: ${tokenIdBytes.length}`);
    }

    return Buffer.concat([
        // Token Id (`String`): UTF-8 encoded string, maximum 128 characters
        // (we allow only simple characters that are encoded as 1 byte in utf-8)
        // Serialized as: `[length: uint32][data: bytes]`
        encodeWord32(tokenIdBytes.length),
        tokenIdBytes,
        // Token Module (`Hash`): 32-byte hash identifying the token module
        // Serialized as: `[32 bytes]`
        Buffer.from(new Uint8Array(parameters.moduleRef.bytes)),
        // Decimals (`uint8`): Number of decimal places for the token
        // Serialized as: `[1 byte]`
        encodeWord8(parameters.decimals),
        // Initialization Parameters (`ByteArray`): Variable-length initialization data
        // Serialized as: `[length: uint32][data: bytes]`
        encodeWord32(parameters.initializationParameters.bytes.length),
        Buffer.from(new Uint8Array(parameters.initializationParameters.bytes))
    ]);
}

/**
 * Serializes a MinBlockTime to the byte format expected
 * by the chain.
 */
export function serializeMinBlockTime(minBlockTime: MinBlockTime) {
    const serializedMinBlockTime = encodeWord64(
        BigInt(minBlockTime.minBlockTime)
    );
    return serializedMinBlockTime;
}

/**
 * Serializes TimeoutParameters to the byte format expected
 * by the chain.
 */
export function serializeTimeoutParameters(
    timeoutParameters: TimeoutParameters
) {
    return Buffer.concat([
        encodeWord64(timeoutParameters.timeoutBase),
        encodeWord64(timeoutParameters.timeoutIncrease.numerator),
        encodeWord64(timeoutParameters.timeoutIncrease.denominator),
        encodeWord64(timeoutParameters.timeoutDecrease.numerator),
        encodeWord64(timeoutParameters.timeoutDecrease.denominator),
    ]);
}

/**
 * Serializes an ElectionDifficulty to bytes.
 */
export function serializeElectionDifficulty(
    electionDifficulty: ElectionDifficulty
) {
    const serializedElectionDifficulty = Buffer.alloc(4);
    serializedElectionDifficulty.writeUInt32BE(
        electionDifficulty.electionDifficulty,
        0
    );
    return serializedElectionDifficulty;
}

/**
 * Serializes an ExchangeRate to bytes.
 */
export function serializeExchangeRate(exchangeRate: ExchangeRate) {
    const serializedNumerator = encodeWord64(BigInt(exchangeRate.numerator));
    const serializedDenominator = encodeWord64(
        BigInt(exchangeRate.denominator)
    );
    return Buffer.concat([serializedNumerator, serializedDenominator]);
}

/**
 * Serializes a TransactionFeeDistribution to bytes.
 */
export function serializeTransactionFeeDistribution(
    transactionFeeDistribution: TransactionFeeDistribution
) {
    const serializedTransactionFeeDistribution = Buffer.alloc(8);
    serializedTransactionFeeDistribution.writeUInt32BE(
        transactionFeeDistribution.baker,
        0
    );
    serializedTransactionFeeDistribution.writeUInt32BE(
        transactionFeeDistribution.gasAccount,
        4
    );
    return serializedTransactionFeeDistribution;
}

/**
 * Serializes a FoundationAccount to bytes.
 */
export function serializeFoundationAccount(
    foundationAccount: FoundationAccount
) {
    const serializedFoundationAccount = Buffer.alloc(32);
    putBase58Check(serializedFoundationAccount, 0, foundationAccount.address);
    return serializedFoundationAccount;
}

/**
 * Serializes a MintDistribution to bytes.
 */
export function serializeMintDistribution(mintDistribution: MintDistribution) {
    const serializedRewards = Buffer.alloc(8);
    serializedRewards.writeUInt32BE(mintDistribution.bakingReward, 0);
    serializedRewards.writeUInt32BE(mintDistribution.finalizationReward, 4);
    if (mintDistribution.version === 0) {
        const serializedMint = Buffer.alloc(5);
        serializedMint.writeUInt32BE(mintDistribution.mintPerSlot.mantissa, 0);
        serializedMint.writeInt8(mintDistribution.mintPerSlot.exponent, 4);
        return Buffer.concat([serializedMint, serializedRewards]);
    }
    return serializedRewards;
}

/**
 * Serializes a string as its UTF-8 encoding pre-fixed with the length
 * of the encoding. We restrict the length of the input to be less than
 * what can be handled safely in a number value.
 * @param input the string to serialize
 */
export function serializeUtf8String(input: string): SerializedTextWithLength {
    // A UTF-8 character can take up to 4 bytes per character.
    if (input.length > Number.MAX_SAFE_INTEGER / 4) {
        throw new Error(`The string was too long: ${input.length}`);
    }

    const encoded = Buffer.from(new TextEncoder().encode(input));
    const serializedLength = encodeWord64(BigInt(encoded.length));
    return { length: serializedLength, data: encoded };
}

/**
 * Serializes a ProtocolUpdate to bytes.
 */
export function serializeProtocolUpdate(
    protocolUpdate: ProtocolUpdate
): SerializedProtocolUpdate {
    const encodedMessage = serializeUtf8String(protocolUpdate.message);
    const encodedSpecificationUrl = serializeUtf8String(
        protocolUpdate.specificationUrl
    );

    const auxiliaryData = protocolUpdate.specificationAuxiliaryData
        ? Buffer.from(protocolUpdate.specificationAuxiliaryData, 'base64')
        : Buffer.alloc(0);
    const specificationHash = Buffer.from(
        protocolUpdate.specificationHash,
        'hex'
    );

    const payloadLength: bigint =
        BigInt(8) +
        BigInt(encodedMessage.data.length) +
        BigInt(8) +
        BigInt(encodedSpecificationUrl.data.length) +
        BigInt(specificationHash.length) +
        BigInt(auxiliaryData.length);

    const serializedPayloadLength = encodeWord64(payloadLength);

    const serialization = Buffer.concat([
        serializedPayloadLength,
        encodedMessage.length,
        encodedMessage.data,
        encodedSpecificationUrl.length,
        encodedSpecificationUrl.data,
        specificationHash,
        auxiliaryData,
    ]);

    return {
        serialization,
        payloadLength: serializedPayloadLength,
        message: encodedMessage,
        specificationUrl: encodedSpecificationUrl,
        transactionHash: specificationHash,
        auxiliaryData,
    };
}

/**
 * Serializes a GasRewards to bytes.
 */
export function serializeGasRewards(gasRewards: GasRewards) {
    const serializedGasRewards = [];
    serializedGasRewards.push(encodeWord32(gasRewards.baker));
    if (gasRewards.version === 0) {
        serializedGasRewards.push(encodeWord32(gasRewards.finalizationProof));
    }
    serializedGasRewards.push(encodeWord32(gasRewards.accountCreation));
    serializedGasRewards.push(encodeWord32(gasRewards.chainUpdate));

    return Buffer.concat(serializedGasRewards);
}

/**
 * Serializes an AddIdentityProvider update's payload to bytes.
 */
export function serializeAddIdentityProvider(
    addIdentityProvider: AddIdentityProvider
) {
    const data = serializeIpInfo(addIdentityProvider);
    const length = encodeWord32(data.length);
    return Buffer.concat([length, data]);
}

/**
 * Serializes an AddAnonymityRevoker update's payload to bytes.
 */
export function serializeAddAnonymityRevoker(
    addAnonymityRevoker: AddAnonymityRevoker
) {
    const data = serializeArInfo(addAnonymityRevoker);
    const length = encodeWord32(data.length);
    return Buffer.concat([length, data]);
}

/**
 * Serializes time parameters to bytes.
 */
export function serializeTimeParameters(timeParameters: TimeParameters) {
    const serializedRewardPeriod = encodeWord64(
        BigInt(timeParameters.rewardPeriodLength)
    );
    const serializedMintRate = Buffer.alloc(5);
    serializedMintRate.writeUInt32BE(
        timeParameters.mintRatePerPayday.mantissa,
        0
    );
    serializedMintRate.writeInt8(timeParameters.mintRatePerPayday.exponent, 4);
    return Buffer.concat([serializedRewardPeriod, serializedMintRate]);
}

/**
 * Serializes cooldown parameters to bytes.
 */
export function serializeCooldownParameters(
    cooldownParameters: CooldownParameters
) {
    const serializedPoolOwnerCooldown = encodeWord64(
        BigInt(cooldownParameters.poolOwnerCooldown)
    );
    const serializedDelegatorCooldown = encodeWord64(
        BigInt(cooldownParameters.delegatorCooldown)
    );
    return Buffer.concat([
        serializedPoolOwnerCooldown,
        serializedDelegatorCooldown,
    ]);
}

export function serializeCommisionRates(commisionRates: CommissionRates) {
    const serializedRates = Buffer.alloc(12);
    serializedRates.writeUInt32BE(
        commisionRates.finalizationRewardCommission,
        0
    );
    serializedRates.writeUInt32BE(commisionRates.bakingRewardCommission, 4);
    serializedRates.writeUInt32BE(commisionRates.transactionFeeCommission, 8);
    return serializedRates;
}

export function serializeCommisionRanges(commisionRates: CommissionRanges) {
    const serializedRanges = Buffer.alloc(24);
    serializedRanges.writeUInt32BE(
        commisionRates.finalizationRewardCommission.min,
        0
    );
    serializedRanges.writeUInt32BE(
        commisionRates.finalizationRewardCommission.max,
        4
    );
    serializedRanges.writeUInt32BE(
        commisionRates.bakingRewardCommission.min,
        8
    );
    serializedRanges.writeUInt32BE(
        commisionRates.bakingRewardCommission.max,
        12
    );
    serializedRanges.writeUInt32BE(
        commisionRates.transactionFeeCommission.min,
        16
    );
    serializedRanges.writeUInt32BE(
        commisionRates.transactionFeeCommission.max,
        20
    );
    return serializedRanges;
}

export function serializeEquityBounds(poolParameters: PoolParameters) {
    return Buffer.concat([
        encodeWord64(BigInt(poolParameters.minimumEquityCapital)),
        encodeWord32(poolParameters.capitalBound),
        encodeWord64(BigInt(poolParameters.leverageBound.numerator)),
        encodeWord64(BigInt(poolParameters.leverageBound.denominator)),
    ]);
}

/**
 * Serializes pool parameters to bytes.
 */
export function serializePoolParameters(poolParameters: PoolParameters) {
    return Buffer.concat([
        serializeCommisionRates(poolParameters.passiveCommissions),
        serializeCommisionRanges(poolParameters.commissionBounds),
        serializeEquityBounds(poolParameters),
    ]);
}

/**
 * Serializes an UpdateHeader to exactly 28 bytes. See the interface
 * UpdateHeader for comments regarding the byte allocation for each field.
 */
export function serializeUpdateHeader(updateHeader: UpdateHeader): Buffer {
    const serializedSequenceNumber = encodeWord64(
        BigInt(updateHeader.sequenceNumber)
    );
    const serializedEffectiveTime = encodeWord64(
        BigInt(updateHeader.effectiveTime)
    );
    const serializedTimeout = encodeWord64(BigInt(updateHeader.timeout));
    const serializedUpdateHeader = Buffer.concat([
        serializedSequenceNumber,
        serializedEffectiveTime,
        serializedTimeout,
    ]);

    if (!updateHeader.payloadSize) {
        throw new Error('Unexpected missing payloadSize');
    }
    const serializedPayloadSize = encodeWord32(updateHeader.payloadSize);
    return Buffer.concat([serializedUpdateHeader, serializedPayloadSize]);
}

/**
 * Serializes a list of signatures to the format expected by the chain. The serialization
 * is given by:
 *
 *  - [signatureListLength (keyIndex signatureLength signatureBytes) * signatureListLength]
 *
 * The signatureListLength, keyIndex and signatureLength are all serialized as Word16.
 * @param signatures list of update instruction signatures, i.e. pairs of (key index, signature)
 */
function serializeUpdateSignatures(
    signatures: UpdateInstructionSignatureWithIndex[]
): Buffer {
    // To ensure a unique serialization, the signatures must be serialized in order of their index.
    const sortedSignatures = signatures.sort((sig1, sig2) => {
        return sig1.authorizationKeyIndex - sig2.authorizationKeyIndex;
    });

    const signatureCount = Buffer.alloc(2);
    signatureCount.writeInt16BE(signatures.length, 0);

    const prefixedSignatures = sortedSignatures.reduce((result, signature) => {
        const signaturePrefix = Buffer.alloc(2 + 2);
        signaturePrefix.writeInt16BE(signature.authorizationKeyIndex, 0);
        const signatureAsBytes = Buffer.from(signature.signature, 'hex');
        signaturePrefix.writeInt16BE(signatureAsBytes.length, 2);
        return Buffer.concat([result, signaturePrefix, signatureAsBytes]);
    }, Buffer.alloc(0));

    return Buffer.concat([signatureCount, prefixedSignatures]);
}

/**
 * Maps the internal wallet update type to the corresponding on chain update types. This
 * mapping is necessary as there are more internal update types, than there are
 * on-chain update types.
 */
function mapUpdateTypeToOnChainUpdateType(type: UpdateType): OnChainUpdateType {
    switch (type) {
        case UpdateType.UpdateProtocol:
            return OnChainUpdateType.UpdateProtocol;
        case UpdateType.UpdateElectionDifficulty:
            return OnChainUpdateType.UpdateElectionDifficulty;
        case UpdateType.UpdateEuroPerEnergy:
            return OnChainUpdateType.UpdateEuroPerEnergy;
        case UpdateType.UpdateMicroGTUPerEuro:
            return OnChainUpdateType.UpdateMicroGTUPerEuro;
        case UpdateType.UpdateFoundationAccount:
            return OnChainUpdateType.UpdateFoundationAccount;
        case UpdateType.UpdateMintDistribution:
            return OnChainUpdateType.UpdateMintDistribution;
        case UpdateType.UpdateTransactionFeeDistribution:
            return OnChainUpdateType.UpdateTransactionFeeDistribution;
        case UpdateType.UpdateGASRewards:
            return OnChainUpdateType.UpdateGASRewards;
        case UpdateType.UpdateBakerStakeThreshold:
            return OnChainUpdateType.UpdateBakerStakeThreshold;
        case UpdateType.UpdateRootKeys:
            return OnChainUpdateType.UpdateRootKeys;
        case UpdateType.UpdateLevel1KeysUsingRootKeys:
            return OnChainUpdateType.UpdateRootKeys;
        case UpdateType.UpdateLevel1KeysUsingLevel1Keys:
            return OnChainUpdateType.UpdateLevel1Keys;
        case UpdateType.UpdateLevel2KeysUsingRootKeys:
            return OnChainUpdateType.UpdateRootKeys;
        case UpdateType.UpdateLevel2KeysUsingLevel1Keys:
            return OnChainUpdateType.UpdateLevel1Keys;
        case UpdateType.AddIdentityProvider:
            return OnChainUpdateType.AddIdentityProvider;
        case UpdateType.AddAnonymityRevoker:
            return OnChainUpdateType.AddAnonymityRevoker;
        case UpdateType.CooldownParameters:
            return OnChainUpdateType.UpdateCooldownParameters;
        case UpdateType.PoolParameters:
            return OnChainUpdateType.UpdatePoolParameters;
        case UpdateType.TimeParameters:
            return OnChainUpdateType.UpdateTimeParameters;
        case UpdateType.UpdateMintDistributionV1:
            return OnChainUpdateType.UpdateMintDistributionV1;
        case UpdateType.BlockEnergyLimit:
            return OnChainUpdateType.UpdateBlockEnergyLimit;
        case UpdateType.FinalizationCommitteeParameters:
            return OnChainUpdateType.UpdateFinalizationCommitteeParameters;
        case UpdateType.MinBlockTime:
            return OnChainUpdateType.UpdateMinBlockTime;
        case UpdateType.TimeoutParameters:
            return OnChainUpdateType.UpdateTimeoutParameters;
        case UpdateType.UpdateGASRewardsV1:
            return OnChainUpdateType.UpdateGASRewardsV1;
        case UpdateType.UpdateValidatorScoreParameters:
            return OnChainUpdateType.UpdateValidatorScoreParameters;
        case UpdateType.UpdateCreatePltParameters:
            return OnChainUpdateType.UpdateCreatePltParameters;
        default:
            throw new Error(`An invalid update type was given: ${type}`);
    }
}

/**
 * Serializes an on chain update type to its byte representation.
 */
export function serializeUpdateType(updateType: UpdateType) {
    const serializedUpdateType = Buffer.alloc(1);
    const onChainUpdateType = mapUpdateTypeToOnChainUpdateType(updateType);
    serializedUpdateType.writeInt8(onChainUpdateType, 0);
    return serializedUpdateType;
}

/**
 * Serializes an UpdateInstruction into its byte representation that is to be
 * signed. Note that this excludes the signatures that are part of the serialization
 * that is sent to the chain.
 */
export function serializeUpdateInstructionHeaderAndPayload(
    updateInstruction: UpdateInstruction<UpdateInstructionPayload>,
    serializedPayload: Buffer
) {
    const updateHeaderWithPayloadSize = {
        ...updateInstruction.header,
        payloadSize: serializedPayload.length + 1,
    };
    const serializedHeader = serializeUpdateHeader(updateHeaderWithPayloadSize);
    const serializedUpdateType = serializeUpdateType(updateInstruction.type);

    return Buffer.concat([
        serializedHeader,
        serializedUpdateType,
        serializedPayload,
    ]);
}

/**
 * Serializes an update instruction, including serialization of the signatures. This is
 * the serialization that the chain expects, and the hash of this serialization is the
 * transaction hash that can be used to look up a submitted transaction. Note that a
 * node does not accept this serialization directly, as it expects transactions to be
 * wrapped in a versioning wrapper.
 * @param updateInstruction the transaction to serialize
 */
export function serializeUpdateInstruction(
    updateInstruction: UpdateInstruction<UpdateInstructionPayload>,
    signaturesWithIndices: UpdateInstructionSignatureWithIndex[],
    serializedPayload: Buffer
) {
    const serializedHeaderAndPayload = serializeUpdateInstructionHeaderAndPayload(
        updateInstruction,
        serializedPayload
    );
    const serializedSignatures = serializeUpdateSignatures(
        signaturesWithIndices
    );

    const blockItemKind = Buffer.alloc(1);
    blockItemKind.writeInt8(BlockItemKind.UpdateInstructionKind, 0);

    return Buffer.concat([
        blockItemKind,
        serializedHeaderAndPayload,
        serializedSignatures,
    ]);
}

// TODO: used?
/**
 * Serialize an update instruction, including serialization of the signatures, so that
 * it can be submitted to a node. The serialization update instruction is is pre-fixed
 * with a version (currently hardcoded as 0), as that is required by the node.
 * @param updateInstruction the transaction to serialize
 */
export function serializeForSubmission(
    updateInstruction: UpdateInstruction<UpdateInstructionPayload>,
    signaturesWithIndices: UpdateInstructionSignatureWithIndex[],
    serializedPayload: Buffer
) {
    // Currently versioning is hardcoded to 0. This value might be changed if
    // the interface is updated at some point.
    const version = Buffer.alloc(1);
    version.writeInt8(0, 0);

    const serializedTransaction = serializeUpdateInstruction(
        updateInstruction,
        signaturesWithIndices,
        serializedPayload
    );
    return Buffer.concat([version, serializedTransaction]);
}
