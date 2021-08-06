import { credentials, Metadata } from '@grpc/grpc-js';
import { ConcordiumNodeClient, AccountAddress } from '@concordium/node-sdk';
import grpcMethods from '../constants/grpcMethods.json';
import AdvancedConcordiumNodeClient from './ConcordiumNodeClient';

const defaultDeadlineMs = 15000;
let client: ConcordiumNodeClient;
let advancedClient: AdvancedConcordiumNodeClient;
const metadata = new Metadata();
metadata.add('authentication', 'rpcadmin');

export function setClientLocation(address: string, port: string) {
    advancedClient = new AdvancedConcordiumNodeClient(
        address,
        parseInt(port, 10),
        defaultDeadlineMs
    );
    client = new ConcordiumNodeClient(
        address,
        parseInt(port, 10),
        credentials.createInsecure(),
        metadata,
        defaultDeadlineMs
    );
}

export function grpcCall(name: string, input: Record<string, string>) {
    switch (name) {
        case grpcMethods.nodeInfo:
            return advancedClient.getNodeInfo();
        case grpcMethods.getConsensusStatus:
            return client.getConsensusStatus();
        case grpcMethods.sendTransaction: {
            const { transactionPayload, networkId } = input;
            return advancedClient.sendTransaction(
                Uint8Array.from(Buffer.from(transactionPayload, 'hex')),
                parseInt(networkId, 10)
            );
        }
        case grpcMethods.getTransactionStatus: {
            const { transactionId } = input;
            return client.getTransactionStatus(transactionId);
        }
        case grpcMethods.peerList: {
            const { includeBootstrappers } = input;
            return client.getPeerList(Boolean(includeBootstrappers));
        }
        case grpcMethods.getNextAccountNonce: {
            const address = new AccountAddress(input.address);
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
            return advancedClient.getCryptographicParameters(blockHashValue);
        }
        case grpcMethods.getAccountInfo: {
            const { blockHash } = input;
            const address = new AccountAddress(input.address);
            return client.getAccountInfo(address, blockHash);
        }
        default: {
            throw new Error('Unrecognized GRPC call');
        }
    }
}
