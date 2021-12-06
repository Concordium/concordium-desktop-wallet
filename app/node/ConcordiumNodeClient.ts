import { credentials, Metadata, ServiceError } from '@grpc/grpc-js';
import { P2PClient } from '~/proto/concordium_p2p_rpc_grpc_pb';
import {
    SendTransactionRequest,
    BoolResponse,
} from '~/proto/concordium_p2p_rpc_pb';

interface GRPCClient extends P2PClient {
    waitForReady?(date: Date, cb: (error: ServiceError) => void): void;
}

type Command<T, Response> = (
    input: T,
    metadata: Metadata,
    callback: (error: ServiceError, response: Response) => void
) => Promise<Response>;

interface Serializable {
    serializeBinary(): Uint8Array;
}

/**
 * A concordium-node specific GRPC client for communicating with nodes on
 * the network. This GRPC client should be used on the main thread, and
 * invoked using IPC from a renderer thread.
 */
export default class ConcordiumNodeClient {
    client: GRPCClient;

    address: string;

    port: number;

    deadline: number;

    /**
     * Initialize a GRPC client for a concordium-node
     * @param address the ip address of the node, e.g. 127.0.0.1
     * @param port the port to use when connecting to the node
     * @param deadline milliseconds to wait before timing out, defaults to 15000ms
     */
    constructor(address: string, port: number, deadline = 15000) {
        this.address = address;
        this.port = port;
        this.deadline = deadline;
        this.client = new P2PClient(
            `${address}:${port}`,
            credentials.createInsecure()
        );
    }

    buildMetaData(): Metadata {
        const meta = new Metadata();
        meta.add('authentication', 'rpcadmin');
        return meta;
    }

    async sendTransaction(transactionPayload: Uint8Array, networkId = 100) {
        const request = new SendTransactionRequest();
        request.setNetworkId(networkId);
        request.setPayload(transactionPayload);

        const response = await this.sendRequest(
            this.client.sendTransaction,
            request
        );
        return BoolResponse.deserializeBinary(response).getValue();
    }

    sendRequest<T, Response extends Serializable>(
        command: Command<T, Response>,
        input: T
    ) {
        const requestDeadline = new Date(new Date().getTime() + this.deadline);
        return new Promise<Uint8Array>((resolve, reject) => {
            if (this.client.waitForReady === undefined) {
                reject(
                    new Error('The client is missing the waitForReady function')
                );
            } else {
                this.client.waitForReady(requestDeadline, (error) => {
                    if (error) {
                        return reject(error);
                    }

                    return command.bind(this.client)(
                        input,
                        this.buildMetaData(),
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
}
