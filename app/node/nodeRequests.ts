/**
 * All these methods are wrappers to call a Concordium Node / P2PClient using GRPC.
 * The requests will be sent to the main thread, which will execute them.
 */

/**
 * Updates the location of the node endpoint;
 */
export function setClientLocation(address: string, port: string) {
    return window.grpc.setLocation(address, port);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function wrapper<T extends any[], V>(
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

export const getBlockSummary = wrapper(
    window.grpc.getBlockSummary,
    (blockHash) => `unable to load blocksummary, on block: ${blockHash}`
);
export const getAccountInfo = wrapper(
    window.grpc.getAccountInfo,
    (address) => `unable to load accountInfo for ${address}`
);
export const getNextAccountNonce = wrapper(
    window.grpc.getNextAccountNonce,
    (address) => `Unable to fetch next nonce on address: ${address}`
);

export const {
    getTransactionStatus,
    getConsensusStatus,
    getNodeInfo,
    getCryptographicParameters,
} = window.grpc;
