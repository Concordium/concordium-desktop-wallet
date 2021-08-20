import { credentials, Metadata } from '@grpc/grpc-js';
import { ConcordiumNodeClient } from '@concordium/node-sdk';
import AdvancedConcordiumNodeClient from './ConcordiumNodeClient';

const defaultDeadlineMs = 15000;
let client: ConcordiumNodeClient;
let advancedClient: AdvancedConcordiumNodeClient;
const metadata = new Metadata();
metadata.add('authentication', 'rpcadmin');

export function setClientLocation(address: string, port: string) {
    advancedClient = new AdvancedConcordiumNodeClient(
        address,
        parseInt(port, 10),
        defaultDeadlineMs
    );
    client = new ConcordiumNodeClient(
        address,
        parseInt(port, 10),
        credentials.createInsecure(),
        metadata,
        defaultDeadlineMs
    );
}

export const getClient = () => client;
export const getAdvancedClient = () => advancedClient;
