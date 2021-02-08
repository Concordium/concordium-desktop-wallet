import ConcordiumLedgerClient from '../../features/ledger/ConcordiumLedgerClient';
import { getGovernancePath } from '../../features/ledger/Path';
import MicroGtuPerEuroView from '../../pages/multisig/MicroGtuPerEuroView';
import { TransactionHandler, UpdateInstruction } from '../types';
import { serializeUpdateInstructionHeaderAndPayload } from '../UpdateSerialization';

export default class MicroGtuPerEuroHandler
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
        return ledger.signMicroGtuPerEuro(this.transaction, path);
    }

    view() {
        return MicroGtuPerEuroView({ exchangeRate: this.transaction.payload });
    }
}
