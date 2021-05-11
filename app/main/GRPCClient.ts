import { credentials, Metadata, ServiceError } from '@grpc/grpc-js';
import { P2PClient } from '../proto/concordium_p2p_rpc_grpc_pb';
import {
    BlockHash,
    SendTransactionRequest,
    TransactionHash,
    AccountAddress,
    GetAddressInfoRequest,
    Empty,
} from '../proto/concordium_p2p_rpc_pb';
import grpcMethods from '../constants/grpcMethods.json';

/**
 * All these methods are wrappers to call a Concordium Node / P2PClient using GRPC.
 * N.B. This file belongs to the main thread, and should not be used directly from the renderer thread.
 */

interface GRPCClient extends P2PClient {
    waitForReady?(date: Date, cb: (error: ServiceError) => void): void;
}

const defaultDeadlineMs = 15000;
let client: GRPCClient;
const clientCredentials = credentials.createInsecure();

export function setClientLocation(address: string, port: string) {
    client = new P2PClient(`${address}:${port}`, clientCredentials);
}

function buildMetaData(): Metadata {
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

interface Serializable {
    serializeBinary(): Uint8Array;
}

type Command<T, Response> = (
    input: T,
    metadata: Metadata,
    callback: (error: ServiceError, response: Response) => void
) => Promise<Response>;

/**
 * Sends a command with GRPC to the node with the provided input.
 * @param command command to execute
 * @param input input for the command
 */
function sendPromise<T, Response extends Serializable>(
    command: Command<T, Response>,
    input: T
) {
    const defaultDeadline = new Date(new Date().getTime() + defaultDeadlineMs);
    return new Promise<Uint8Array>((resolve, reject) => {
        if (client.waitForReady === undefined) {
            reject(new Error('Unexpected missing client function'));
        } else {
            client.waitForReady(defaultDeadline, (error) => {
                if (error) {
                    return reject(error);
                }

                return command.bind(client)(
                    input,
                    buildMetaData(),
                    (err, response) => {
                        if (err) {
                            return reject(err);
                        }
                        return resolve(response.serializeBinary());
                    }
                );
            });
        }
    });
}

function sendTransaction(transactionPayload: Uint8Array, networkId = 100) {
    const request = buildSendTransactionRequest(transactionPayload, networkId);

    return sendPromise(client.sendTransaction, request);
}

function getTransactionStatus(transactionId: string) {
    const transactionHash = new TransactionHash();
    transactionHash.setTransactionHash(transactionId);

    return sendPromise(client.getTransactionStatus, transactionHash);
}

function getNextAccountNonce(address: string) {
    const accountAddress = new AccountAddress();
    accountAddress.setAccountAddress(address);

    return sendPromise(client.getNextAccountNonce, accountAddress);
}

/**
 * Retrieves the ConsensusStatus information from the node.
 */
function getConsensusStatus() {
    return sendPromise(client.getConsensusStatus, new Empty());
}

/**
 * Retrieves the block summary for the provided block hash from the node.
 * @param blockHashValue the block hash to retrieve the block summary for
 */
function getBlockSummary(blockHashValue: string) {
    const blockHash = new BlockHash();
    blockHash.setBlockHash(blockHashValue);
    return sendPromise(client.getBlockSummary, blockHash);
}

function getAccountInfo(address: string, blockHash: string) {
    const requestData = new GetAddressInfoRequest();
    requestData.setAddress(address);
    requestData.setBlockHash(blockHash);

    return sendPromise(client.getAccountInfo, requestData);
}

function getNodeInfo() {
    return sendPromise(client.nodeInfo, new Empty());
}

function getBirkParameters(blockHashValue: string) {
    const blockHash = new BlockHash();
    blockHash.setBlockHash(blockHashValue);
    return sendPromise(client.getBirkParameters, blockHash);
}

function getCryptographicParameters(blockHashValue: string) {
    const blockHash = new BlockHash();
    blockHash.setBlockHash(blockHashValue);
    return sendPromise(client.getCryptographicParameters, blockHash);
}

export function grpcCall(name: string, input: Record<string, string>) {
    switch (name) {
        case grpcMethods.nodeInfo:
            return getNodeInfo();
        case grpcMethods.getConsensusStatus:
            return getConsensusStatus();
        case grpcMethods.sendTransaction: {
            const { transactionPayload, networkId } = input;
            return sendTransaction(
                Uint8Array.from(Buffer.from(transactionPayload, 'hex')),
                parseInt(networkId, 10)
            );
        }
        case grpcMethods.getTransactionStatus: {
            const { transactionId } = input;
            return getTransactionStatus(transactionId);
        }
        case grpcMethods.getNextAccountNonce: {
            const { address } = input;
            return getNextAccountNonce(address);
        }
        case grpcMethods.getBlockSummary: {
            const { blockHashValue } = input;
            return getBlockSummary(blockHashValue);
        }
        case grpcMethods.getCryptographicParameters: {
            const { blockHashValue } = input;
            return getCryptographicParameters(blockHashValue);
        }
        case grpcMethods.getAccountInfo: {
            const { address, blockHash } = input;
            return getAccountInfo(address, blockHash);
        }
        case grpcMethods.getBirkParameters: {
            const { blockHash } = input;
            return getBirkParameters(blockHash);
        }
        default: {
            throw new Error('unknown GRPC call');
        }
    }
}
