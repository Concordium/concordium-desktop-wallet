import grpc from 'grpc';
import { P2PClient } from '../proto/api_grpc_pb';
import {
    BlockHash,
    JSONResponse,
    SendTransactionRequest,
    TransactionHash
} from '../proto/api_pb';

const port = 10000;
const address = "localhost"; // "172.31.33.57";
const client = new P2PClient(
    `${address}:${port}`,
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

export function getBlockSummary(blockHashValue: string): Promise<JSONResponse> {
    return new Promise<JSONResponse>((resolve, reject) => {
        const blockHash = new BlockHash();
        blockHash.setBlockHash(blockHashValue);

        client.getBlockSummary(blockHash, buildMetaData(), (err, response) => {
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
): Promise<JSONResponse> {
    return new Promise<JSONResponse>((resolve, reject) => {
        const request = buildSendTransactionRequest(
            transactionPayload,
            networkId
        );

        client.sendTransaction(request, buildMetaData(), (err, response) => {
            if (err) {
                return reject(err);
            }
            return resolve(response);
        });
    });
}

export function getTransactionStatus(transactionId: string): Promise<JSONResponse> {
    return new Promise<JSONResponse>((resolve, reject) => {
        const transactionHash = new TransactionHash();
        transactionHash.setTransactionHash(transactionId);

        client.getTransactionStatus(transactionHash, buildMetaData(), (err, response) => {
            if (err) {
                return reject(err);
            }
            return resolve(response);
        });
    });
}
