import ConcordiumLedgerClient from '../../features/ledger/ConcordiumLedgerClient';
import { getGovernancePath } from '../../features/ledger/Path';
import FoundationAccountView from '../../pages/multisig/FoundationAccountView';
import {
    FoundationAccount,
    isFoundationAccount,
    TransactionHandler,
    UpdateInstruction,
    UpdateInstructionPayload,
} from '../types';
import { serializeFoundationAccount } from '../UpdateSerialization';

export default class FoundationAccountHandler
    implements
        TransactionHandler<
            UpdateInstruction<FoundationAccount>,
            ConcordiumLedgerClient
        > {
    transaction: UpdateInstruction<FoundationAccount>;

    constructor(transaction: UpdateInstruction<UpdateInstructionPayload>) {
        if (isFoundationAccount(transaction)) {
            this.transaction = transaction;
        } else {
            throw Error('Invalid transaction type was given as input.');
        }
    }

    serializePayload() {
        return serializeFoundationAccount(this.transaction.payload);
    }

    signTransaction(ledger: ConcordiumLedgerClient) {
        const path: number[] = getGovernancePath({ keyIndex: 0, purpose: 0 });
        return ledger.signFoundationAccount(
            this.transaction,
            this.serializePayload(),
            path
        );
    }

    view() {
        return FoundationAccountView({
            foundationAccount: this.transaction.payload,
        });
    }
}
