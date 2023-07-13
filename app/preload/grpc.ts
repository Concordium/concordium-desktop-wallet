import {
    createConcordiumClient,
    ConcordiumGRPCClient,
} from '@concordium/web-sdk';
import {
    AccountTransactionHeader,
    AccountTransactionSignature,
    BakerId,
    CredentialDeploymentTransaction,
    UpdateInstruction,
} from '@concordium/common-sdk/lib/types';
import { AccountAddress } from '@concordium/common-sdk/lib/types/accountAddress';
import { CredentialRegistrationId } from '@concordium/common-sdk/lib/types/CredentialRegistrationId';
import { streamToList } from '@concordium/common-sdk/lib/util';
import type { Buffer } from 'buffer/';

import { GRPC, ConsensusAndGlobalResult } from '~/preload/preloadTypes';

const defaultDeadlineMs = 15000;
let client: ConcordiumGRPCClient;

export function setClientLocation(address: string, port: string) {
    client = createConcordiumClient(address, Number.parseInt(port, 10), {
        timeout: defaultDeadlineMs,
    });
}

async function getConsensusStatusAndCryptographicParameters(
    address: string,
    port: string
): Promise<ConsensusAndGlobalResult> {
    try {
        const newClient = createConcordiumClient(
            address,
            Number.parseInt(port, 10),
            { timeout: defaultDeadlineMs }
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
    setLocation: async (address: string, port: string) => {
        return setClientLocation(address, port);
    },
    sendAccountTransaction: (
        header: AccountTransactionHeader,
        payload: Buffer,
        baseEnergyCost: bigint,
        signature: AccountTransactionSignature
    ) =>
        client.sendRawAccountTransaction(
            header,
            payload,
            baseEnergyCost,
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
    getPeerList: async () => client.getPeersInfo(),
    // Creates a standalone GRPC client for testing the connection
    // to a node. This is used to verify that when changing connection
    // that the new node is on the same blockchain as the wallet was previously connected to.
    nodeConsensusAndGlobal: async (address: string, port: string) => {
        return getConsensusStatusAndCryptographicParameters(address, port);
    },
    getRewardStatus: (blockHash?: string) =>
        client.getTokenomicsInfo(blockHash),
    getPoolInfo: (bakerId: BakerId, blockHash?: string) =>
        client.getPoolInfo(bakerId, blockHash),
    getPassiveDelegationInfo: (blockHash?: string) =>
        client.getPassiveDelegationInfo(blockHash),
};

export default exposedMethods;
