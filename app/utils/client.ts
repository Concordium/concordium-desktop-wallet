import { credentials, Metadata } from '@grpc/grpc-js';
import { P2PClient } from '../proto/concordium_p2p_rpc_grpc_pb';
import {
    BlockHash,
    JsonResponse,
    SendTransactionRequest,
    TransactionHash,
    AccountAddress,
    GetAddressInfoRequest,
    Empty,
} from '../proto/concordium_p2p_rpc_pb';
import { ExchangeRate } from './types';

/**
 * All these methods are wrappers to call a Concordium Node / P2PClient using GRPC.
 */

const port = 10000;
const clientAddress = '172.31.33.57'; // TODO: This should be a setting? (The user should be able to decide which node to use)

const client = new P2PClient(
    `${clientAddress}:${port}`,
    credentials.createInsecure()
);

function buildMetaData(): MetaData {
    const meta = new Metadata();
    meta.add('authentication', 'rpcadmin');
    return meta;
}

function buildSendTransactionRequest(
    payload: Uint8Array,
    networkId: number
): SendTransactionRequest {
    const request = new SendTransactionRequest();
    request.setNetworkId(networkId);
    request.setPayload(payload);
    return request;
}

function sendPromise(command, input) {
    return new Promise<JsonResponse>((resolve, reject) => {
        command.bind(client)(input, buildMetaData(), (err, response) => {
            if (err) {
                return reject(err);
            }
            return resolve(response);
        });
    });
}

export function sendTransaction(
    transactionPayload: Uint8Array,
    networkId = 100
): Promise<JsonResponse> {
    const request = buildSendTransactionRequest(transactionPayload, networkId);

    return sendPromise(client.sendTransaction, request);
}

export function getTransactionStatus(
    transactionId: string
): Promise<JsonResponse> {
    const transactionHash = new TransactionHash();
    transactionHash.setTransactionHash(transactionId);

    return sendPromise(client.getTransactionStatus, transactionHash);
}

export function getNextAccountNonce(address: string): Promise<JsonResponse> {
    const accountAddress = new AccountAddress();
    accountAddress.setAccountAddress(address);

    return sendPromise(client.getNextAccountNonce, accountAddress);
}

function sendPromiseParseResult<T>(command, input) {
    return new Promise<T>((resolve, reject) => {
        command.bind(client)(input, buildMetaData(), (err, response) => {
            if (err) {
                return reject(err);
            }
            return resolve(JSON.parse(response.getValue()));
        });
    });
}

/**
 * Model that matches what is returned by the node when getting the
 * current consensus status.
 * Currently only the fields required by existing functionality has been
 * added. If additional fields are required, then extend the interface.
 */
export interface ConsensusStatus {
    lastFinalizedBlock: string;
}

/**
 * Retrieves the ConsensusStatus information from the node.
 */
export function getConsensusStatus(): Promise<ConsensusStatus> {
    return sendPromiseParseResult<ConsensusStatus>(
        client.getConsensusStatus,
        new Empty()
    );
}

interface UpdateQueue {
    nextSequenceNumber: BigInt;
    queue;
}

interface UpdateQueues {
    microGTUPerEuro: UpdateQueue;
}

interface Authorization {
    threshold: number;
    authorizedKeys: number[];
}

interface Authorizations {
    microGTUPerEuro: Authorization;
}

interface ChainParameters {
    microGTUPerEuro: ExchangeRate;
}

interface Updates {
    authorizations: Authorizations;
    chainParameters: ChainParameters;
    updateQueues: UpdateQueues;
}

export interface BlockSummary {
    updates: Updates;
}

/**
 * Retrieves the block summary for the provided block hash from the node.
 * @param blockHashValue the block hash to retrieve the block summary for
 */
export function getBlockSummary(blockHashValue: string): Promise<BlockSummary> {
    const blockHash = new BlockHash();
    blockHash.setBlockHash(blockHashValue);
    return sendPromiseParseResult<BlockSummary>(
        client.getBlockSummary,
        blockHash
    );
}

export function getAccountInfo(
    address: string,
    blockHash: string
): Promise<JsonResponse> {
    const requestData = new GetAddressInfoRequest();
    requestData.setAddress(address);
    requestData.setBlockHash(blockHash);

    return sendPromise(client.getAccountInfo, requestData);
}

export function getNodeInfo(): Promise<NodeInfoResponse> {
    return sendPromise(client.nodeInfo, new Empty());
}
