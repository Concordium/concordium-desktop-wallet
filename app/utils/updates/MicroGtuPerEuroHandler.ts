import ConcordiumLedgerClient from '../../features/ledger/ConcordiumLedgerClient';
import { getGovernancePath } from '../../features/ledger/Path';
import MicroGtuPerEuroView from '../../pages/multisig/MicroGtuPerEuroView';
import UpdateMicroGtuPerEuro from '../../pages/multisig/UpdateMicroGtuPerEuro';
import { Authorizations } from '../NodeApiTypes';
import { UpdateInstructionHandler } from '../transactionTypes';
import {
    ExchangeRate,
    UpdateInstruction,
    isExchangeRate,
    UpdateInstructionPayload,
} from '../types';
import { serializeExchangeRate } from '../UpdateSerialization';

type TransactionType = UpdateInstruction<ExchangeRate>;

export default class MicroGtuPerEuroHandler
    implements
        UpdateInstructionHandler<TransactionType, ConcordiumLedgerClient> {
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
        return ledger.signMicroGtuPerEuro(
            transaction,
            this.serializePayload(transaction),
            path
        );
    }

    view(transaction: TransactionType) {
        return MicroGtuPerEuroView({ exchangeRate: transaction.payload });
    }

    getAuthorization(authorizations: Authorizations) {
        return authorizations.microGTUPerEuro;
    }

    update = UpdateMicroGtuPerEuro;

    title = 'Foundation Transaction | Update Micro GTU Per Euro';
}
