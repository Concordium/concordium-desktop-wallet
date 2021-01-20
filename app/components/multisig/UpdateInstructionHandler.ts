import ConcordiumLedgerClient from '../../features/ledger/ConcordiumLedgerClient';
import {
    instanceOfUpdateInstruction,
    TransactionHandler,
    UpdateInstruction,
    UpdateType,
} from '../../utils/types';
import { serializeUpdateInstruction } from '../../utils/UpdateSerialization';

export class UpdateInstructionHandler
    implements TransactionHandler<UpdateInstruction> {
    instanceOf(transaction: UpdateInstruction): boolean {
        return instanceOfUpdateInstruction(transaction);
    }

    serializeTransaction(transaction: UpdateInstruction): Buffer {
        return serializeUpdateInstruction(transaction);
    }

    signTransaction(
        ledger: ConcordiumLedgerClient,
        transaction: UpdateInstruction
    ) {
        const { type } = transaction;
        switch (type) {
            case UpdateType.UpdateMicroGTUPerEuro:
                return ledger.getPrfKey(0);
            default:
                throw Error(`Unsupported UpdateType: ${type}`);
        }
    }
}
