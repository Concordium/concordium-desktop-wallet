import AccountTransactionDetails from '~/components/Transfers/AccountTransactionDetails';
import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import { AccountPathInput, getAccountPath } from '~/features/ledger/Path';
import { AccountTransactionHandler } from '~/utils/transactionTypes';
import {
    AccountTransaction,
    TransactionPayload,
    UpdateBakerKeys,
    instanceOfUpdateBakerKeys,
} from '../types';
import { serializeTransferPayload } from '../transactionSerialization';

type TransactionType = UpdateBakerKeys;

const TYPE = 'Update Baker Keys';

export default class UpdateBakerKeysHandler
    implements
        AccountTransactionHandler<TransactionType, ConcordiumLedgerClient> {
    confirmType(
        transaction: AccountTransaction<TransactionPayload>
    ): TransactionType {
        if (instanceOfUpdateBakerKeys(transaction)) {
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

    creationLocationHandler(_currentLocation: string, _proposalId: number) {
        throw new Error('Unimplemented');
        return '';
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

    title = `Account Transaction | ${TYPE}`;

    type = TYPE;
}
