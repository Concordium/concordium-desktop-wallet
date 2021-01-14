import grpc from 'grpc';
import { P2PClient } from '../proto/api_grpc_pb';
import {
    BlockHash,
    JSONResponse,
    SendTransactionRequest,
    TransactionHash,
    AccountAddress,
    GetAddressInfoRequest,
    Empty,
} from '../proto/api_pb';

/**
 * All these methods are wrappers to call a Concordium Node / P2PClient using GRPC.
 */

const port = 10000;
const clientAddress = '172.31.33.57'; // TODO: This should be a setting? (The user should be able to decide which node to use)

const client = new P2PClient(
    `${clientAddress}:${port}`,
    grpc.credentials.createInsecure()
);

function buildMetaData(): MetaData {
    const meta = new grpc.Metadata();
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
    return new Promise<JSONResponse>((resolve, reject) => {
        command.bind(client)(input, buildMetaData(), (err, response) => {
            if (err) {
                return reject(err);
            }
            return resolve(response);
        });
    });
}

export function getBlockSummary(blockHashValue: string): Promise<JSONResponse> {
    const blockHash = new BlockHash();
    blockHash.setBlockHash(blockHashValue);

    return sendPromise(client.getBlockSummary, blockHash);
}

export function sendTransaction(
    transactionPayload: Uint8Array,
    networkId = 100
): Promise<JSONResponse> {
    const request = buildSendTransactionRequest(transactionPayload, networkId);

    return sendPromise(client.sendTransaction, request);
}

export function getTransactionStatus(
    transactionId: string
): Promise<JSONResponse> {
    const transactionHash = new TransactionHash();
    transactionHash.setTransactionHash(transactionId);

    return sendPromise(client.getTransactionStatus, transactionHash);
}

export function getNextAccountNonce(address: string): Promise<JSONResponse> {
    const accountAddress = new AccountAddress();
    accountAddress.setAccountAddress(address);

    return sendPromise(client.getNextAccountNonce, accountAddress);
}

export function getConsensusInfo(): Promise<JSONResponse> {
    return sendPromise(client.getConsensusStatus, new Empty());
}

export function getAccountInfo(
    address: string,
    blockHash: string
): Promise<JSONResponse> {
    const requestData = new GetAddressInfoRequest();
    requestData.setAddress(address);
    requestData.setBlockHash(blockHash);

    return sendPromise(client.getAccountInfo, requestData);
}

export function getNodeInfo(): Promise<NodeInfoResponse> {
    return sendPromise(client.nodeInfo, new Empty());
}
