import ConcordiumLedgerClient from '../../features/ledger/ConcordiumLedgerClient';
import {
    instanceOfUpdateInstruction,
    TransactionHandler,
    UpdateInstruction,
    UpdateType,
} from '../../utils/types';
import { serializeUpdateInstructionHeaderAndPayload } from '../../utils/UpdateSerialization';

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
        return serializeUpdateInstructionHeaderAndPayload(this.transaction);
    }

    signTransaction(ledger: ConcordiumLedgerClient) {
        const { type } = this.transaction;
        switch (type) {
            case UpdateType.UpdateMicroGTUPerEuro:
                return ledger.signMicroGtuPerEuro(this.transaction);
            default:
                throw Error(`Unsupported UpdateType: ${type}`);
        }
    }
}
