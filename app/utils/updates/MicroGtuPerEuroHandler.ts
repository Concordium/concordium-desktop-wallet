import ConcordiumLedgerClient from '../../features/ledger/ConcordiumLedgerClient';
import { getGovernancePath } from '../../features/ledger/Path';
import MicroGtuPerEuroView from '../../pages/multisig/MicroGtuPerEuroView';
import {
    ExchangeRate,
    isExchangeRate,
    TransactionHandler,
    UpdateInstruction,
    UpdateInstructionPayload,
} from '../types';
import serializeExchangeRate from '../UpdateSerialization';

export default class MicroGtuPerEuroHandler
    implements
        TransactionHandler<
            UpdateInstruction<ExchangeRate>,
            ConcordiumLedgerClient
        > {
    transaction: UpdateInstruction<ExchangeRate>;

    constructor(transaction: UpdateInstruction<UpdateInstructionPayload>) {
        if (isExchangeRate(transaction)) {
            this.transaction = transaction;
        } else {
            throw Error('Invalid transaction type was given as input.');
        }
    }

    serializePayload() {
        return serializeExchangeRate(this.transaction.payload);
    }

    signTransaction(ledger: ConcordiumLedgerClient) {
        const path: number[] = getGovernancePath({ keyIndex: 0, purpose: 0 });
        return ledger.signMicroGtuPerEuro(
            this.transaction,
            this.serializePayload(),
            path
        );
    }

    view() {
        return MicroGtuPerEuroView({ exchangeRate: this.transaction.payload });
    }
}
