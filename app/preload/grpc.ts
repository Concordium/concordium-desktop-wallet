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
    Energy,
    serializeCredentialDeploymentPayload,
    TransactionExpiry,
    BlockHash,
    TransactionHash,
} from '@concordium/web-sdk';
import {
    ConcordiumGRPCNodeClient,
    credentials,
} from '@concordium/web-sdk/nodejs';
import type { Buffer } from 'buffer/';

import { GRPC, ConsensusAndGlobalResult } from '~/preload/preloadTypes';

const defaultDeadlineMs = 15000;
let client: ConcordiumGRPCClient;

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
            .then((v) => v.toString()),
    sendUpdateInstruction: (
        updateInstructionTransaction: UpdateInstruction,
        signatures: Record<number, string>
    ) =>
        client
            .sendUpdateInstruction(updateInstructionTransaction, signatures)
            .then((v) => v.toString()),
    sendCredentialDeploymentTransaction: (
        transaction: CredentialDeploymentTransaction,
        signatures: string[]
    ) =>
        client
            .sendCredentialDeploymentTransaction(
                serializeCredentialDeploymentPayload(signatures, transaction),
                TransactionExpiry.futureMinutes(5)
            )
            .then((v) => v.toString()),
    getCryptographicParameters: (blockHash: string) =>
        client.getCryptographicParameters(BlockHash.fromHexString(blockHash)),
    getConsensusStatus: () => client.getConsensusStatus(),
    getTransactionStatus: (transactionHash: string) =>
        client.getBlockItemStatus(
            TransactionHash.fromHexString(transactionHash)
        ),
    getNextAccountNonce: (address: string) =>
        client.getNextAccountNonce(AccountAddress.fromBase58(address)),
    getBlockChainParameters: (blockHash?: string) =>
        client.getBlockChainParameters(
            blockHash ? BlockHash.fromHexString(blockHash) : undefined
        ),
    getNextUpdateSequenceNumbers: (blockHash?: string) =>
        client.getNextUpdateSequenceNumbers(
            blockHash ? BlockHash.fromHexString(blockHash) : undefined
        ),
    getAccountInfo: (address: string, blockHash?: string) => {
        return client.getAccountInfo(
            AccountAddress.fromBase58(address),
            blockHash ? BlockHash.fromHexString(blockHash) : undefined
        );
    },
    getAccountInfoOfCredential: (credId: string, blockHash?: string) => {
        return client.getAccountInfo(
            CredentialRegistrationId.fromHexString(credId),
            blockHash ? BlockHash.fromHexString(blockHash) : undefined
        );
    },
    getIdentityProviders: (blockHash: string) =>
        streamToList(
            client.getIdentityProviders(BlockHash.fromHexString(blockHash))
        ),
    getAnonymityRevokers: (blockHash: string) =>
        streamToList(
            client.getAnonymityRevokers(BlockHash.fromHexString(blockHash))
        ),
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
        client.getTokenomicsInfo(
            blockHash ? BlockHash.fromHexString(blockHash) : undefined
        ),
    getPoolInfo: (bakerId: BakerId, blockHash?: string) =>
        client.getPoolInfo(
            bakerId,
            blockHash ? BlockHash.fromHexString(blockHash) : undefined
        ),
    getPassiveDelegationInfo: (blockHash?: string) =>
        client.getPassiveDelegationInfo(
            blockHash ? BlockHash.fromHexString(blockHash) : undefined
        ),
};

export default exposedMethods;
