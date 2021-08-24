import { AccountAddress } from '@concordium/node-sdk';
import {
    setClientLocation,
    getAdvancedClient,
    getClient,
} from '~/node/GRPCClient';
import ConcordiumNodeClient from '~/node/ConcordiumNodeClient';
import { GRPC } from '~/preload/preloadTypes';

async function getConsensusStatusAndCryptographicParameters(
    address: string,
    port: string
) {
    try {
        const nodeClient = new ConcordiumNodeClient(
            address,
            Number.parseInt(port, 10)
        );
        const consensusStatus = await nodeClient.getConsensusStatus();
        const globalSerialized = await nodeClient.getCryptographicParameters(
            consensusStatus.lastFinalizedBlock
        );
        return {
            successful: true,
            response: {
                consensus: consensusStatus,
                global: globalSerialized,
            },
        };
    } catch (error) {
        return { successful: false, error };
    }
}

const exposedMethods: GRPC = {
    // Updates the location of the grpc endpoint.
    setLocation: async (address: string, port: string) => {
        return setClientLocation(address, port);
    },
    getNodeInfo: () => getAdvancedClient().getNodeInfo(),
    sendTransaction: (transactionPayload: Uint8Array, networkId: number) =>
        getAdvancedClient().sendTransaction(transactionPayload, networkId),
    getCryptographicParameters: (blockHash: string) =>
        getAdvancedClient().getCryptographicParameters(blockHash),
    getConsensusStatus: () => getClient().getConsensusStatus(),
    getTransactionStatus: (transactionId: string) =>
        getClient().getTransactionStatus(transactionId),
    getNextAccountNonce: (address: string) =>
        getClient().getNextAccountNonce(new AccountAddress(address)),
    getBlockSummary: (blockHash: string) =>
        getClient().getBlockSummary(blockHash),
    getAccountInfo: (addressRaw: string, blockHash: string) => {
        const address = new AccountAddress(addressRaw);
        return getClient().getAccountInfo(address, blockHash);
    },
    // Creates a standalone GRPC client for testing the connection
    // to a node. This is used to verify that when changing connection
    // that the new node is on the same blockchain as the wallet was previously connected to.
    nodeConsensusAndGlobal: async (address: string, port: string) => {
        return getConsensusStatusAndCryptographicParameters(address, port);
    },
};

export default exposedMethods;
