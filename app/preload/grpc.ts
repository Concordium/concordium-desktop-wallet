import {
    ConcordiumGRPCClient,
    AccountTransactionHeader,
    AccountTransactionSignature,
    BakerId,
    UpdateInstruction,
    CredentialRegistrationId,
    AccountAddress,
    streamToList,
    Energy,
    BlockHash,
    TransactionHash,
} from '@concordium/web-sdk';

import {
    ConcordiumGRPCClient as ConcordiumGRPCNodeClientv6,
    CredentialDeploymentTransaction,
} from '@concordium/web-sdk-v6';

import { credentials as credentialsv6 } from '@grpc/grpc-js';

import {
    ConcordiumGRPCNodeClient,
    credentials,
} from '@concordium/web-sdk/nodejs';
import type { Buffer } from 'buffer/';
import { GrpcTransport } from '@protobuf-ts/grpc-transport';
import { GRPC, ConsensusAndGlobalResult } from '~/preload/preloadTypes';
import { stringify } from '~/utils/JSONHelper';

const defaultDeadlineMs = 15000;
let client: ConcordiumGRPCClient;
let clientv6: ConcordiumGRPCNodeClientv6;

function createConcordiumClient(
    address: string,
    port: number,
    useSsl: boolean,
    timeout: number
) {
    return new ConcordiumGRPCNodeClient(
        address,
        port,
        useSsl ? credentials.createSsl() : credentials.createInsecure(),
        { timeout }
    );
}
function createConcordiumClientV6(
    address: string,
    port: number,
    useSsl: boolean,
    timeout: number
) {
    const grpcTransport = new GrpcTransport({
        host: `${address}:${port}`,
        channelCredentials: useSsl
            ? credentialsv6.createSsl()
            : credentialsv6.createInsecure(),
        timeout,
    });
    return new ConcordiumGRPCNodeClientv6(grpcTransport);
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
    clientv6 = createConcordiumClientV6(
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
    setLocation: (address: string, port: string, useSsl: boolean) => {
        return setClientLocation(address, port, useSsl);
    },
    sendAccountTransaction: (
        header: AccountTransactionHeader,
        energyCost: bigint,
        payload: Buffer,
        signature: AccountTransactionSignature
    ) =>
        client
            .sendRawAccountTransaction(
                header,
                Energy.create(energyCost),
                payload,
                signature
            )
            .then(stringify),
    sendUpdateInstruction: (
        updateInstructionTransaction: UpdateInstruction,
        signatures: Record<number, string>
    ) =>
        client
            .sendUpdateInstruction(updateInstructionTransaction, signatures)
            .then(stringify),
    sendCredentialDeploymentTransaction: (
        transaction: CredentialDeploymentTransaction,
        signatures: string[]
    ) =>
        clientv6
            .sendCredentialDeploymentTransaction(transaction, signatures)
            .then(stringify),
    getCryptographicParameters: (blockHash: string) =>
        client
            .getCryptographicParameters(BlockHash.fromHexString(blockHash))
            .then(stringify),
    getConsensusStatus: () => client.getConsensusStatus().then(stringify),
    getTransactionStatus: (transactionHash: string) =>
        client
            .getBlockItemStatus(TransactionHash.fromHexString(transactionHash))
            .then(stringify),
    getNextAccountNonce: (address: string) =>
        client
            .getNextAccountNonce(AccountAddress.fromBase58(address))
            .then(stringify),
    getBlockChainParameters: (blockHash?: string) =>
        client
            .getBlockChainParameters(
                blockHash ? BlockHash.fromHexString(blockHash) : undefined
            )
            .then(stringify),
    getNextUpdateSequenceNumbers: (blockHash?: string) =>
        client
            .getNextUpdateSequenceNumbers(
                blockHash ? BlockHash.fromHexString(blockHash) : undefined
            )
            .then(stringify),
    getAccountInfo: (address: string, blockHash?: string) =>
        client
            .getAccountInfo(
                AccountAddress.fromBase58(address),
                blockHash ? BlockHash.fromHexString(blockHash) : undefined
            )
            .then(stringify),
    getAccountInfoOfCredential: (credId: string, blockHash?: string) =>
        client
            .getAccountInfo(
                CredentialRegistrationId.fromHexString(credId),
                blockHash ? BlockHash.fromHexString(blockHash) : undefined
            )
            .then(stringify),
    getIdentityProviders: (blockHash: string) =>
        streamToList(
            client.getIdentityProviders(BlockHash.fromHexString(blockHash))
        ).then(stringify),
    getAnonymityRevokers: (blockHash: string) =>
        streamToList(
            client.getAnonymityRevokers(BlockHash.fromHexString(blockHash))
        ).then(stringify),
    healthCheck: async () => client.healthCheck().then(stringify),
    // Creates a standalone GRPC client for testing the connection
    // to a node. This is used to verify that when changing connection
    // that the new node is on the same blockchain as the wallet was previously connected to.
    nodeConsensusAndGlobal: async (
        address: string,
        port: string,
        useSsl: boolean
    ) =>
        getConsensusStatusAndCryptographicParameters(
            address,
            port,
            useSsl
        ).then(stringify),
    getRewardStatus: (blockHash?: string) =>
        client
            .getTokenomicsInfo(
                blockHash ? BlockHash.fromHexString(blockHash) : undefined
            )
            .then(stringify),
    getPoolInfo: (bakerId: BakerId, blockHash?: string) =>
        client
            .getPoolInfo(
                bakerId,
                blockHash ? BlockHash.fromHexString(blockHash) : undefined
            )
            .then(stringify),
    getPassiveDelegationInfo: (blockHash?: string) =>
        client
            .getPassiveDelegationInfo(
                blockHash ? BlockHash.fromHexString(blockHash) : undefined
            )
            .then(stringify),
};

export default exposedMethods;
