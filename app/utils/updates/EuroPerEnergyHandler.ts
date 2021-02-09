import ConcordiumLedgerClient from '../../features/ledger/ConcordiumLedgerClient';
import { getGovernancePath } from '../../features/ledger/Path';
import EuroPerEnergyView from '../../pages/multisig/EuroPerEnergyView';
import { TransactionHandler, UpdateInstruction } from '../types';
import { serializeUpdateInstructionHeaderAndPayload } from '../UpdateSerialization';

export default class EuroPerEnergyHandler
    implements TransactionHandler<UpdateInstruction, ConcordiumLedgerClient> {
    transaction: UpdateInstruction;

    constructor(transaction: UpdateInstruction) {
        this.transaction = transaction;
    }

    serialize() {
        return serializeUpdateInstructionHeaderAndPayload(this.transaction);
    }

    signTransaction(ledger: ConcordiumLedgerClient) {
        const path: number[] = getGovernancePath({ keyIndex: 0, purpose: 0 });
        return ledger.signEuroPerEnergy(this.transaction, path);
    }

    view() {
        return EuroPerEnergyView({ exchangeRate: this.transaction.payload });
    }
}
