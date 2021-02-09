import ConcordiumLedgerClient from '../../features/ledger/ConcordiumLedgerClient';
import { getGovernancePath } from '../../features/ledger/Path';
import EuroPerEnergyView from '../../pages/multisig/EuroPerEnergyView';
import {
    ExchangeRate,
    isExchangeRate,
    TransactionHandler,
    UpdateInstruction,
    UpdateInstructionPayload,
} from '../types';
import { serializeExchangeRate } from '../UpdateSerialization';

export default class EuroPerEnergyHandler
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
        return ledger.signEuroPerEnergy(
            this.transaction,
            this.serializePayload(),
            path
        );
    }

    view() {
        return EuroPerEnergyView({ exchangeRate: this.transaction.payload });
    }
}
