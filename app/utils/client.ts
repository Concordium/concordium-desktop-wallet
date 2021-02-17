import { ipcRenderer } from 'electron';
import {
    BoolResponse,
    JsonResponse,
    NodeInfoResponse,
} from '../proto/concordium_p2p_rpc_pb';
import { BlockSummary, ConsensusStatus, AccountNonce } from './NodeApiTypes';
import { Setting, AccountInfo } from './types';

import ipcCommands from '../constants/ipcCommands.json';

/**
 * All these methods are wrappers to call a Concordium Node / P2PClient using GRPC.
 */

export function setClientLocation(address: string, port: string) {
    return ipcRenderer.invoke(ipcCommands.grpcSetLocation, address, port);
}

// Extracts node location from settings, and pass them to the grpc client.
export function startClient(nodeLocationSetting: Setting) {
    const { address, port } = JSON.parse(nodeLocationSetting.value);
    setClientLocation(address, port);
}

/**
 * Sends a command with GRPC to the node with the provided input.
 * @param command command to execute
 * @param input input for the command
 */
function sendPromise(
    command: string,
    input: Record<string, string> = {}
): Promise<Uint8Array> {
    return ipcRenderer.invoke(ipcCommands.grpcCall, command, input);
}

/**
 * Executes the provided GRPC command towards the node with the provided
 * input.
 * @param command command to execute towards the node
 * @param input input for the command
 */
async function sendPromiseParseResult(
    command: string,
    input?: Record<string, string>
) {
    const response = await sendPromise(command, input);
    return JSON.parse(JsonResponse.deserializeBinary(response).getValue());
}

export async function sendTransaction(
    transactionPayload: Uint8Array,
    networkId = 100
): Promise<BoolResponse> {
    const response = await sendPromise('sendTransaction', {
        transactionPayload: Buffer.from(transactionPayload).toString('hex'),
        networkId: networkId.toString(),
    });
    return BoolResponse.deserializeBinary(response);
}

export async function getTransactionStatus(
    transactionId: string
): Promise<JsonResponse> {
    const response = await sendPromise('getTransactionStatus', {
        transactionId,
    });
    return JsonResponse.deserializeBinary(response);
}

export function getNextAccountNonce(address: string): Promise<AccountNonce> {
    return sendPromiseParseResult('getNextAccountNonce', { address });
}

/**
 * Retrieves the ConsensusStatus information from the node.
 */
export function getConsensusStatus(): Promise<ConsensusStatus> {
    return sendPromiseParseResult('getConsensusStatus');
}

/**
 * Retrieves the block summary for the provided block hash from the node.
 * @param blockHashValue the block hash to retrieve the block summary for
 */
export function getBlockSummary(blockHashValue: string): Promise<BlockSummary> {
    return sendPromiseParseResult('getBlockSummary', { blockHashValue });
}

export function getAccountInfo(
    address: string,
    blockHash: string
): Promise<AccountInfo> {
    return sendPromiseParseResult('getAccountInfo', { address, blockHash });
}

export async function getNodeInfo(): Promise<NodeInfoResponse> {
    const response = await sendPromise('nodeInfo');
    return NodeInfoResponse.deserializeBinary(response);
}
