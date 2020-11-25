import type Transport from '@ledgerhq/hw-transport';
import getPublicKey from './GetPublicKey';
import signTransfer from './Transfer';
import { getIdCredSec, getPrfKey } from './ExportPrivateKeySeed';
import { AccountTransaction } from '../../utils/types';

/**
 * Concordium Ledger API.
 *
 * @example
 * import ConcordiumLedgerClient from "..."
 * const client = new ConcordiumLedgerClient(transport);
 */
export default class ConcordiumLedgerClient {
    transport: Transport;

    constructor(transport: Transport) {
        this.transport = transport;

        transport.decorateAppAPIMethods(
            this,
            ['getPublicKey', 'getIdCredSec', 'getPrfKey', 'signTransfer'],
            'GTU'
        );
    }

    getPublicKey(path: number[]): Promise<{ publicKey: Buffer }> {
        return getPublicKey(this.transport, path);
    }

    getIdCredSec(identity: number): Promise<{ idCredSecSeed: Buffer }> {
        return getIdCredSec(this.transport, identity);
    }

    getPrfKey(identity: number): Promise<{ prfKeySeed: Buffer }> {
        return getPrfKey(this.transport, identity);
    }

    signTransfer(transaction: AccountTransaction, path: number[]): Promise<{ signature: Buffer }> {
        return signTransfer(this.transport, path, transaction);
    }
}
