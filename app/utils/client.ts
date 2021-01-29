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

/**
 * All these methods are wrappers to call a Concordium Node / P2PClient using GRPC.
 */

let client;
const clientCredentials = credentials.createInsecure();

export function setClientLocation(address, port) {
    client = new P2PClient(`${address}:${port}`, clientCredentials);
}

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

export function getBlockSummary(blockHashValue: string): Promise<JsonResponse> {
    const blockHash = new BlockHash();
    blockHash.setBlockHash(blockHashValue);

    return sendPromise(client.getBlockSummary, blockHash);
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

export function getConsensusInfo(): Promise<JsonResponse> {
    return sendPromise(client.getConsensusStatus, new Empty());
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
