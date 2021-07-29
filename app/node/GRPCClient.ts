import grpcMethods from '../constants/grpcMethods.json';
import ConcordiumNodeClient from './ConcordiumNodeClient';

const defaultDeadlineMs = 15000;
let client: ConcordiumNodeClient;

export function setClientLocation(address: string, port: string) {
    client = new ConcordiumNodeClient(
        address,
        parseInt(port, 10),
        defaultDeadlineMs
    );
}

export function grpcCall(name: string, input: Record<string, string>) {
    switch (name) {
        case grpcMethods.nodeInfo:
            return client.getNodeInfo();
        case grpcMethods.getConsensusStatus:
            return client.getConsensusStatus();
        case grpcMethods.sendTransaction: {
            const { transactionPayload, networkId } = input;
            return client.sendTransaction(
                Uint8Array.from(Buffer.from(transactionPayload, 'hex')),
                parseInt(networkId, 10)
            );
        }
        case grpcMethods.getTransactionStatus: {
            const { transactionId } = input;
            return client.getTransactionStatus(transactionId);
        }
        case grpcMethods.getNextAccountNonce: {
            const { address } = input;
            return client.getNextAccountNonce(address);
        }
        case grpcMethods.getBlockSummary: {
            const { blockHashValue } = input;
            return client.getBlockSummary(blockHashValue);
        }
        case grpcMethods.getIdentityProviders: {
            const { blockHashValue } = input;
            return client.getIdentityProviders(blockHashValue);
        }
        case grpcMethods.getAnonymityRevokers: {
            const { blockHashValue } = input;
            return client.getAnonymityRevokers(blockHashValue);
        }
        case grpcMethods.getCryptographicParameters: {
            const { blockHashValue } = input;
            return client.getCryptographicParameters(blockHashValue);
        }
        case grpcMethods.getAccountInfo: {
            const { address, blockHash } = input;
            return client.getAccountInfo(address, blockHash);
        }
        default: {
            throw new Error('Unrecognized GRPC call');
        }
    }
}
