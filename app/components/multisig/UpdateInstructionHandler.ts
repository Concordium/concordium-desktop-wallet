import ConcordiumLedgerClient from '../../features/ledger/ConcordiumLedgerClient';
import {
    instanceOfUpdateInstruction,
    TransactionHandler,
    UpdateInstruction,
    UpdateType,
} from '../../utils/types';
import serializeUpdateInstruction from '../../utils/UpdateSerialization';

export default class UpdateInstructionHandler
    implements TransactionHandler<UpdateInstruction> {
    transaction: UpdateInstruction;

    constructor(transaction: UpdateInstruction) {
        this.transaction = transaction;
    }

    instanceOf(): boolean {
        return instanceOfUpdateInstruction(this.transaction);
    }

    serializeTransaction(): Buffer {
        return serializeUpdateInstruction(this.transaction);
    }

    signTransaction(ledger: ConcordiumLedgerClient) {
        const { type } = this.transaction;
        switch (type) {
            case UpdateType.UpdateMicroGTUPerEuro:
                return ledger.getPrfKey(0);
            default:
                throw Error(`Unsupported UpdateType: ${type}`);
        }
    }
}
