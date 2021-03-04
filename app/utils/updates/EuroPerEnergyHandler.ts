import ConcordiumLedgerClient from '../../features/ledger/ConcordiumLedgerClient';
import { getGovernancePath } from '../../features/ledger/Path';
import EuroPerEnergyView from '../../pages/multisig/EuroPerEnergyView';
import UpdateEuroPerEnergy from '../../pages/multisig/UpdateEuroPerEnergy';
import { Authorizations } from '../NodeApiTypes';
import { TransactionHandler } from '../transactionTypes';
import {
    isExchangeRate,
    ExchangeRate,
    UpdateInstruction,
    UpdateInstructionPayload,
} from '../types';
import { serializeExchangeRate } from '../UpdateSerialization';

type TransactionType = UpdateInstruction<ExchangeRate>;

export default class EuroPerEnergyHandler
    implements TransactionHandler<TransactionType, ConcordiumLedgerClient> {
    confirmType(
        transaction: UpdateInstruction<UpdateInstructionPayload>
    ): TransactionType {
        if (isExchangeRate(transaction)) {
            return transaction;
        }
        throw Error('Invalid transaction type was given as input.');
    }

    serializePayload(transaction: TransactionType) {
        return serializeExchangeRate(transaction.payload);
    }

    signTransaction(
        transaction: TransactionType,
        ledger: ConcordiumLedgerClient
    ) {
        const path: number[] = getGovernancePath({ keyIndex: 0, purpose: 0 });
        return ledger.signEuroPerEnergy(
            transaction,
            this.serializePayload(transaction),
            path
        );
    }

    view(transaction: TransactionType) {
        return EuroPerEnergyView({ exchangeRate: transaction.payload });
    }

    getAuthorization(authorizations: Authorizations) {
        return authorizations.euroPerEnergy;
    }

    update = UpdateEuroPerEnergy;

    title = 'Foundation Transaction | Update Euro Per Energy';
}
