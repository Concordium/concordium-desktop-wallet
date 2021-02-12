import ConcordiumLedgerClient from '../../features/ledger/ConcordiumLedgerClient';
import { getGovernancePath } from '../../features/ledger/Path';
import ProtocolUpdateView from '../../pages/multisig/ProtocolUpdateView';
import {
    isProtocolUpdate,
    ProtocolUpdate,
    TransactionHandler,
    UpdateInstruction,
    UpdateInstructionPayload,
} from '../types';
import { serializeProtocolUpdate } from '../UpdateSerialization';

export default class ProtocolUpdateHandler
    implements
        TransactionHandler<
            UpdateInstruction<ProtocolUpdate>,
            ConcordiumLedgerClient
        > {
    transaction: UpdateInstruction<ProtocolUpdate>;

    constructor(transaction: UpdateInstruction<UpdateInstructionPayload>) {
        if (isProtocolUpdate(transaction)) {
            this.transaction = transaction;
        } else {
            throw Error('Invalid transaction type was given as input.');
        }
    }

    serializePayload() {
        return serializeProtocolUpdate(this.transaction.payload).serialization;
    }

    signTransaction(ledger: ConcordiumLedgerClient) {
        const path: number[] = getGovernancePath({ keyIndex: 0, purpose: 0 });
        return ledger.signProtocolUpdate(
            this.transaction,
            this.serializePayload(),
            path
        );
    }

    view() {
        return ProtocolUpdateView({ protocolUpdate: this.transaction.payload });
    }
}
