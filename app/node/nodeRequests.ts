/**
 * All these methods are wrappers to call a Concordium Node / P2PClient using GRPC.
 */
import {
    isAccountTransactionType,
    TransactionExpiry,
    AccountAddress,
    SequenceNumber,
} from '@concordium/web-sdk';
import type { Buffer } from 'buffer/';
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

export function sendAccountTransaction(
    transaction: AccountTransaction,
    signatures: TransactionAccountSignature
) {
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

    return window.grpc.sendAccountTransaction(
        header,
        BigInt(transaction.energyAmount),
        payload,
        signatures
    );
}

export function sendUpdateInstruction(
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
    return window.grpc.sendUpdateInstruction(transaction, signatures);
}

export const getNextAccountNonce = throwIfUndefined(
    window.grpc.getNextAccountNonce,
    (address) => `Unable to fetch next nonce on address: ${address}`
);
export const getCryptographicParameters = throwIfUndefined(
    window.grpc.getCryptographicParameters,
    (blockHash) =>
        `Unable to load cryptographic parameters, on block: ${blockHash}`
);
export const getAnonymityRevokers = throwIfUndefined(
    window.grpc.getAnonymityRevokers,
    (blockHash) =>
        `Unable to load identity disclosure authorities, on block: ${blockHash}`
);
export const getIdentityProviders = throwIfUndefined(
    window.grpc.getIdentityProviders,
    (blockHash) => `Unable to load identity providers, on block: ${blockHash}`
);

export const {
    getTransactionStatus,
    getConsensusStatus,
    getAccountInfo,
    getAccountInfoOfCredential,
    getBlockChainParameters,
    getNextUpdateSequenceNumbers,
    getRewardStatus,
    getPoolInfo,
    getPassiveDelegationInfo,
    healthCheck,
    sendCredentialDeploymentTransaction,
} = window.grpc;
