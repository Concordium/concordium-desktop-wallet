import AccountTransactionDetails from '~/components/Transfers/AccountTransactionDetails';
import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import { AccountPathInput, getAccountPath } from '~/features/ledger/Path';
import { AccountTransactionHandler } from '~/utils/transactionTypes';
import {
    AccountTransaction,
    TransactionPayload,
    UpdateBakerRestakeEarnings,
    instanceOfUpdateBakerRestakeEarnings,
} from '../types';
import { serializeTransferPayload } from '../transactionSerialization';

type TransactionType = UpdateBakerRestakeEarnings;

const TYPE = 'Update Baker Restake Earnings';

export default class UpdateBakerRestakeEarningsHandler
    implements
        AccountTransactionHandler<TransactionType, ConcordiumLedgerClient> {
    confirmType(
        transaction: AccountTransaction<TransactionPayload>
    ): TransactionType {
        if (instanceOfUpdateBakerRestakeEarnings(transaction)) {
            return transaction;
        }
        throw Error('Invalid transaction type was given as input.');
    }

    serializePayload(transaction: TransactionType) {
        return serializeTransferPayload(
            transaction.transactionKind,
            transaction.payload
        );
    }

    creationLocationHandler(): string {
        throw new Error('Unimplemented');
    }

    async signTransaction(
        transaction: TransactionType,
        ledger: ConcordiumLedgerClient,
        path: AccountPathInput
    ) {
        return ledger.signTransfer(transaction, getAccountPath(path));
    }

    view(transaction: TransactionType) {
        return AccountTransactionDetails({ transaction });
    }

    createTransaction(): Promise<UpdateBakerRestakeEarnings> {
        throw new Error('Unimplemented');
    }

    print = () => undefined;

    title = `Account Transaction | ${TYPE}`;

    type = TYPE;
}
