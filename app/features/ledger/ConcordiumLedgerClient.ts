import type Transport from '@ledgerhq/hw-transport';
import getPublicKey from './GetPublicKey';
import { getIdCredSec, getPrfKey } from './ExportPrivateKeySeed';

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
      ['getPublicKey', 'getIdCredSec', 'getPrfKey'],
      'GTU'
    );
  }

  getPublicKey(path: number[]) {
    return getPublicKey(this.transport, path);
  }

  getIdCredSec(identity: number) {
    return getIdCredSec(this.transport, identity);
  }

  getPrfKey(identity: number) {
    return getPrfKey(this.transport, identity);
  }
}
