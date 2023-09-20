import {
    ConcordiumGRPCClient,
    AccountTransactionHeader,
    AccountTransactionSignature,
    BakerId,
    CredentialDeploymentTransaction,
    UpdateInstruction,
    CredentialRegistrationId,
    AccountAddress,
    streamToList,
} from '@concordium/web-sdk';
import type { Buffer } from 'buffer/';
import { credentials } from '@grpc/grpc-js';
import { GrpcTransport } from '@protobuf-ts/grpc-transport';

import { GRPC, ConsensusAndGlobalResult } from '~/preload/preloadTypes';

const defaultDeadlineMs = 15000;
let client: ConcordiumGRPCClient;

function createConcordiumClient(
    address: string,
    port: number,
    useSsl: boolean,
    timeout: number
) {
    const grpcTransport = new GrpcTransport({
        host: `${address}:${port}`,
        channelCredentials: useSsl
            ? credentials.createSsl()
            : credentials.createInsecure(),
        timeout,
    });
    return new ConcordiumGRPCClient(grpcTransport);
}

export function setClientLocation(
    address: string,
    port: string,
    useSsl: boolean
) {
    client = createConcordiumClient(
        address,
        Number.parseInt(port, 10),
        useSsl,
        defaultDeadlineMs
    );
}

async function getConsensusStatusAndCryptographicParameters(
    address: string,
    port: string,
    useSsl: boolean
): Promise<ConsensusAndGlobalResult> {
    try {
        const newClient = createConcordiumClient(
            address,
            Number.parseInt(port, 10),
            useSsl,
            defaultDeadlineMs
        );
        const consensusStatus = await newClient.getConsensusStatus();
        const global = await newClient.getCryptographicParameters(
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
        return { successful: false, error: error as Error };
    }
}

const exposedMethods: GRPC = {
    // Updates the location of the grpc endpoint.
    setLocation: async (address: string, port: string, useSsl: boolean) => {
        return setClientLocation(address, port, useSsl);
    },
    sendAccountTransaction: (
        header: AccountTransactionHeader,
        energyCost: bigint,
        payload: Buffer,
        signature: AccountTransactionSignature
    ) =>
        client.sendRawAccountTransaction(
            header,
            energyCost,
            payload,
            signature
        ),
    sendUpdateInstruction: (
        updateInstructionTransaction: UpdateInstruction,
        signatures: Record<number, string>
    ) => client.sendUpdateInstruction(updateInstructionTransaction, signatures),
    sendCredentialDeploymentTransaction: (
        transaction: CredentialDeploymentTransaction,
        signatures: string[]
    ) => client.sendCredentialDeploymentTransaction(transaction, signatures),
    getCryptographicParameters: (blockHash: string) =>
        client.getCryptographicParameters(blockHash),
    getConsensusStatus: () => client.getConsensusStatus(),
    getTransactionStatus: (transactionId: string) =>
        client.getBlockItemStatus(transactionId),
    getNextAccountNonce: (address: string) =>
        client.getNextAccountNonce(new AccountAddress(address)),
    getBlockChainParameters: (blockHash?: string) =>
        client.getBlockChainParameters(blockHash),
    getNextUpdateSequenceNumbers: (blockHash?: string) =>
        client.getNextUpdateSequenceNumbers(blockHash),
    getAccountInfo: (address: string, blockHash?: string) => {
        return client.getAccountInfo(new AccountAddress(address), blockHash);
    },
    getAccountInfoOfCredential: (credId: string, blockHash?: string) => {
        return client.getAccountInfo(
            new CredentialRegistrationId(credId),
            blockHash
        );
    },
    getIdentityProviders: (blockHash: string) =>
        streamToList(client.getIdentityProviders(blockHash)),
    getAnonymityRevokers: (blockHash: string) =>
        streamToList(client.getAnonymityRevokers(blockHash)),
    healthCheck: async () => client.healthCheck(),
    // Creates a standalone GRPC client for testing the connection
    // to a node. This is used to verify that when changing connection
    // that the new node is on the same blockchain as the wallet was previously connected to.
    nodeConsensusAndGlobal: async (
        address: string,
        port: string,
        useSsl: boolean
    ) => {
        return getConsensusStatusAndCryptographicParameters(
            address,
            port,
            useSsl
        );
    },
    getRewardStatus: (blockHash?: string) =>
        client.getTokenomicsInfo(blockHash),
    getPoolInfo: (bakerId: BakerId, blockHash?: string) =>
        client.getPoolInfo(bakerId, blockHash),
    getPassiveDelegationInfo: (blockHash?: string) =>
        client.getPassiveDelegationInfo(blockHash),
};

export default exposedMethods;
