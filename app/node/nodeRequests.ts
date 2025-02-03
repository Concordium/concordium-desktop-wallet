/**
 * All these methods are wrappers to call a Concordium Node / P2PClient using GRPC.
 */
import {
    isAccountTransactionType,
    TransactionExpiry,
    AccountAddress,
    SequenceNumber,
    TransactionHash,
    CryptographicParameters,
    ArInfo,
    IpInfo,
    BlockItemStatus,
    ConsensusStatus,
    AccountInfo,
    ChainParameters,
    NextUpdateSequenceNumbers,
    RewardStatus,
    BakerPoolStatus,
    PassiveDelegationStatus,
    HealthCheckResponse,
    NextAccountNonce,
} from '@concordium/web-sdk';
import type { Buffer } from 'buffer/';

import type { ConsensusAndGlobalResult } from '~/preload/preloadTypes';
import { parse } from '~/utils/JSONHelper';
import { serializeTransferPayload } from '~/utils/transactionSerialization';
import {
    AccountTransaction,
    TransactionAccountSignature,
    UpdateInstructionSignatureWithIndex,
    UpdateInstruction,
} from '~/utils/types';
import { serializeUpdateType } from '~/utils/UpdateSerialization';

/**
 * Updates the location of the node endpoint;
 */
export function setClientLocation(
    address: string,
    port: string,
    useSsl: boolean
) {
    return window.grpc.setLocation(address, port, useSsl);
}

/**
 * Takes an async function, which might return undefined, and throws an error instead.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function throwIfUndefined<T extends any[], V>(
    func: (...inputs: T) => Promise<V | undefined>,
    getErrorMessage: (...inputs: T) => string
): (...inputs: T) => Promise<V> {
    return async (...inputs) => {
        const result = await func(...inputs);
        if (!result) {
            throw new Error(getErrorMessage(...inputs));
        }
        return result;
    };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parsed<V, T extends any[]>(
    func: (...inputs: T) => Promise<string>
): (...inputs: T) => Promise<V> {
    return async (...inputs) => func(...inputs).then(parse);
}

export async function sendAccountTransaction(
    transaction: AccountTransaction,
    signatures: TransactionAccountSignature
): Promise<TransactionHash.Type> {
    const type = transaction.transactionKind as number;
    if (!isAccountTransactionType(type)) {
        throw Error(
            'Unreachable: received an account transaction with an invalid transaction type'
        );
    }

    const payload = serializeTransferPayload(
        transaction.transactionKind,
        transaction.payload
    );

    const header = {
        sender: AccountAddress.fromBase58(transaction.sender),
        expiry: TransactionExpiry.fromEpochSeconds(transaction.expiry),
        nonce: SequenceNumber.create(BigInt(transaction.nonce)),
    };

    const input = await window.grpc.sendAccountTransaction(
        header,
        BigInt(transaction.energyAmount),
        payload,
        signatures
    );
    return parse(input);
}

export async function sendUpdateInstruction(
    updateInstruction: UpdateInstruction,
    signaturesWithIndices: UpdateInstructionSignatureWithIndex[],
    serializedPayload: Buffer
) {
    const transaction = {
        header: updateInstruction.header,
        payload:
            serializeUpdateType(updateInstruction.type).toString('hex') +
            serializedPayload.toString('hex'),
    };
    const signatures: Record<number, string> = {};
    signaturesWithIndices.forEach(({ signature, authorizationKeyIndex }) => {
        signatures[authorizationKeyIndex] = signature;
    });
    const input = await window.grpc.sendUpdateInstruction(
        transaction,
        signatures
    );
    return parse(input);
}

export const getNextAccountNonce = throwIfUndefined(
    parsed<
        NextAccountNonce,
        Parameters<typeof window.grpc.getNextAccountNonce>
    >(window.grpc.getNextAccountNonce),
    (address) => `Unable to fetch next nonce on address: ${address}`
);
export const getCryptographicParameters = throwIfUndefined(
    parsed<
        CryptographicParameters,
        Parameters<typeof window.grpc.getCryptographicParameters>
    >(window.grpc.getCryptographicParameters),
    (blockHash) =>
        `Unable to load cryptographic parameters, on block: ${blockHash}`
);
export const getAnonymityRevokers = throwIfUndefined(
    parsed<ArInfo[], Parameters<typeof window.grpc.getAnonymityRevokers>>(
        window.grpc.getAnonymityRevokers
    ),
    (blockHash) =>
        `Unable to load identity disclosure authorities, on block: ${blockHash}`
);
export const getIdentityProviders = throwIfUndefined(
    parsed<IpInfo[], Parameters<typeof window.grpc.getIdentityProviders>>(
        window.grpc.getIdentityProviders
    ),
    (blockHash) => `Unable to load identity providers, on block: ${blockHash}`
);
export const getTransactionStatus = parsed<
    BlockItemStatus,
    Parameters<typeof window.grpc.getTransactionStatus>
>(window.grpc.getTransactionStatus);
export const getConsensusStatus = parsed<
    ConsensusStatus,
    Parameters<typeof window.grpc.getConsensusStatus>
>(window.grpc.getConsensusStatus);
export const getAccountInfo = parsed<
    AccountInfo,
    Parameters<typeof window.grpc.getAccountInfo>
>(window.grpc.getAccountInfo);
export const getAccountInfoOfCredential = parsed<
    AccountInfo,
    Parameters<typeof window.grpc.getAccountInfoOfCredential>
>(window.grpc.getAccountInfoOfCredential);
export const getBlockChainParameters = parsed<
    ChainParameters,
    Parameters<typeof window.grpc.getBlockChainParameters>
>(window.grpc.getBlockChainParameters);
export const getNextUpdateSequenceNumbers = parsed<
    NextUpdateSequenceNumbers,
    Parameters<typeof window.grpc.getNextUpdateSequenceNumbers>
>(window.grpc.getNextUpdateSequenceNumbers);
export const getRewardStatus = parsed<
    RewardStatus,
    Parameters<typeof window.grpc.getRewardStatus>
>(window.grpc.getRewardStatus);
export const getPoolInfo = parsed<
    BakerPoolStatus,
    Parameters<typeof window.grpc.getPoolInfo>
>(window.grpc.getPoolInfo);
export const getPassiveDelegationInfo = parsed<
    PassiveDelegationStatus,
    Parameters<typeof window.grpc.getPassiveDelegationInfo>
>(window.grpc.getPassiveDelegationInfo);
export const healthCheck = parsed<
    HealthCheckResponse,
    Parameters<typeof window.grpc.healthCheck>
>(window.grpc.healthCheck);
export const sendCredentialDeploymentTransaction = parsed<
    TransactionHash.Type,
    Parameters<typeof window.grpc.sendCredentialDeploymentTransaction>
>(window.grpc.sendCredentialDeploymentTransaction);
export const nodeConsensusAndGlobal = parsed<
    ConsensusAndGlobalResult,
    Parameters<typeof window.grpc.nodeConsensusAndGlobal>
>(window.grpc.nodeConsensusAndGlobal);
