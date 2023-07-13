/**
 * All these methods are wrappers to call a Concordium Node / P2PClient using GRPC.
 */

/**
 * Updates the location of the node endpoint;
 */
export function setClientLocation(address: string, port: string) {
    return window.grpc.setLocation(address, port);
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

export function sendTransaction(
    transactionPayload: Uint8Array,
    networkId = 100
) {
    return window.grpc.sendTransaction(transactionPayload, networkId);
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
    (blockHash) => `Unable to load anonymity revokers, on block: ${blockHash}`
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
    getRewardStatus,
    getPoolInfo,
    getPassiveDelegationInfo,
    getPeerList,
} = window.grpc;
