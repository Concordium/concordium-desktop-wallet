import AccountTransactionDetails from '~/components/Transfers/AccountTransactionDetails';
import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import { AccountPathInput, getAccountPath } from '~/features/ledger/Path';
import { AccountTransactionHandler } from '~/utils/transactionTypes';
import {
    AccountTransaction,
    TransactionPayload,
    instanceOfUpdateBakerStake,
    UpdateBakerStake,
} from '../types';
import { serializeTransferPayload } from '../transactionSerialization';

type TransactionType = UpdateBakerStake;

const TYPE = 'Update Baker Stake';

export default class UpdateBakerStakeHandler
    implements
        AccountTransactionHandler<TransactionType, ConcordiumLedgerClient> {
    confirmType(
        transaction: AccountTransaction<TransactionPayload>
    ): TransactionType {
        if (instanceOfUpdateBakerStake(transaction)) {
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

    createTransaction(): Promise<UpdateBakerStake> {
        throw new Error('Unimplemented');
    }

    print = () => undefined;

    title = `Account Transaction | ${TYPE}`;

    type = TYPE;
}
