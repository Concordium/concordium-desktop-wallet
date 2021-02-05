import ConcordiumLedgerClient from '../features/ledger/ConcordiumLedgerClient';
import { getGovernancePath } from '../features/ledger/Path';
import {
    instanceOfUpdateInstruction,
    TransactionHandler,
    UpdateInstruction,
    UpdateType,
} from './types';
import { serializeUpdateInstructionHeaderAndPayload } from './UpdateSerialization';

export default class UpdateInstructionHandler
    implements TransactionHandler<UpdateInstruction, ConcordiumLedgerClient> {
    transaction: UpdateInstruction;

    constructor(transaction: UpdateInstruction) {
        this.transaction = transaction;
    }

    instanceOf(): boolean {
        return instanceOfUpdateInstruction(this.transaction);
    }

    serializeTransaction(): Buffer {
        return serializeUpdateInstructionHeaderAndPayload(this.transaction);
    }

    signTransaction(ledger: ConcordiumLedgerClient) {
        const path: number[] = getGovernancePath({ keyIndex: 0, purpose: 0 });
        const { type } = this.transaction;
        switch (type) {
            case UpdateType.UpdateMicroGTUPerEuro:
                return ledger.signMicroGtuPerEuro(this.transaction, path);
            case UpdateType.UpdateEuroPerEnergy:
                return ledger.signEuroPerEnergy(this.transaction, path);
            default:
                throw Error(`Unsupported UpdateType: ${type}`);
        }
    }
}
