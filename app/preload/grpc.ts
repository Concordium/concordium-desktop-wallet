import {
    AccountAddress,
    CredentialRegistrationId,
    ConcordiumNodeClient,
} from '@concordium/node-sdk';
import { credentials, Metadata } from '@grpc/grpc-js';
import SendTransactionClient from '~/node/ConcordiumNodeClient';
import { GRPC, ConsensusAndGlobalResult } from '~/preload/preloadTypes';
import { BakerId, BakerPoolStatus } from '~/utils/types';

const defaultDeadlineMs = 15000;
let client: ConcordiumNodeClient;
let sendTransactionClient: SendTransactionClient;
const metadata = new Metadata();
metadata.add('authentication', 'rpcadmin');

export function setClientLocation(address: string, port: string) {
    sendTransactionClient = new SendTransactionClient(
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

async function getConsensusStatusAndCryptographicParameters(
    address: string,
    port: string
): Promise<ConsensusAndGlobalResult> {
    try {
        const nodeClient = new ConcordiumNodeClient(
            address,
            Number.parseInt(port, 10),
            credentials.createInsecure(),
            metadata,
            defaultDeadlineMs
        );
        const consensusStatus = await nodeClient.getConsensusStatus();
        const global = await nodeClient.getCryptographicParameters(
            consensusStatus.lastFinalizedBlock
        );
        if (!global) {
            return {
                successful: false,
                error: new Error(
                    'getCryptographicParameters returned undefined. '
                ),
            };
        }
        return {
            successful: true,
            response: {
                consensusStatus,
                global,
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
    sendTransaction: (transactionPayload: Uint8Array, networkId: number) =>
        sendTransactionClient.sendTransaction(transactionPayload, networkId),
    getCryptographicParameters: (blockHash: string) =>
        client.getCryptographicParameters(blockHash),
    getConsensusStatus: () => client.getConsensusStatus(),
    getTransactionStatus: (transactionId: string) =>
        client.getTransactionStatus(transactionId),
    getNextAccountNonce: (address: string) =>
        client.getNextAccountNonce(new AccountAddress(address)),
    getBlockSummary: (blockHash: string) => client.getBlockSummary(blockHash),
    getAccountInfo: (address: string, blockHash: string) => {
        return client.getAccountInfo(new AccountAddress(address), blockHash);
    },
    getAccountInfoOfCredential: (credId: string, blockHash: string) => {
        return client.getAccountInfo(
            new CredentialRegistrationId(credId),
            blockHash
        );
    },
    getIdentityProviders: (blockHash: string) =>
        client.getIdentityProviders(blockHash),
    getAnonymityRevokers: (blockHash: string) =>
        client.getAnonymityRevokers(blockHash),
    getPeerList: async (includeBootstrappers: boolean) =>
        (await client.getPeerList(includeBootstrappers)).serializeBinary(),
    // Creates a standalone GRPC client for testing the connection
    // to a node. This is used to verify that when changing connection
    // that the new node is on the same blockchain as the wallet was previously connected to.
    nodeConsensusAndGlobal: async (address: string, port: string) => {
        return getConsensusStatusAndCryptographicParameters(address, port);
    },
    getPoolInfo: (blockHash: string, bakerId?: BakerId) => {
        // eslint-disable-next-line no-console
        console.log(blockHash, bakerId);
        const dummyPoolInfo: BakerPoolStatus = {
            bakerId: BigInt(123),
            bakerAddress: '123',
            delegatedCapital: BigInt(123),
            bakerEquityCapital: BigInt(123),
            delegatedCapitalCap: BigInt(1230),
            currentPaydayStatus: {
                delegatedCapital: BigInt(123),
            },
            poolInfo: '',
            bakerStakePendingChange: '',
        };

        return Promise.resolve(dummyPoolInfo);
    },
};

export default exposedMethods;
