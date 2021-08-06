import { ConsensusStatus } from '@concordium/node-sdk';
import { setClientLocation, grpcCall } from '~/node/GRPCClient';
import ConcordiumNodeClient from '~/node/ConcordiumNodeClient';
import { JsonResponse } from '~/proto/concordium_p2p_rpc_pb';
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
        const consensusStatusSerialized = await nodeClient.getConsensusStatus();
        const consensusStatus: ConsensusStatus = JSON.parse(
            JsonResponse.deserializeBinary(consensusStatusSerialized).getValue()
        );
        const globalSerialized = await nodeClient.getCryptographicParameters(
            consensusStatus.lastFinalizedBlock
        );
        return {
            successful: true,
            response: {
                consensus: consensusStatusSerialized,
                global: globalSerialized,
            },
        };
    } catch (error) {
        return { successful: false, error };
    }
}

async function performGrpcCall(command: string, input: Record<string, string>) {
    try {
        const response = await grpcCall(command, input);
        return { successful: true, response };
    } catch (error) {
        return { successful: false, error };
    }
}

const exposedMethods: GRPC = {
    // Updates the location of the grpc endpoint.
    setLocation: async (address: string, port: string) => {
        return setClientLocation(address, port);
    },
    // Performs the given grpc command, with the given input;
    call: async (command: string, input: Record<string, string>) => {
        return performGrpcCall(command, input);
    },
    // Creates a standalone GRPC client for testing the connection
    // to a node. This is used to verify that when changing connection
    // that the new node is on the same blockchain as the wallet was previously connected to.
    nodeConsensusAndGlobal: async (address: string, port: string) => {
        return getConsensusStatusAndCryptographicParameters(address, port);
    },
};

export default exposedMethods;
