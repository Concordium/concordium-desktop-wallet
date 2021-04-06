import {
    ScheduledTransfer,
    AccountTransaction,
    TransactionPayload,
    instanceOfScheduledTransfer,
} from '../types';
import routes from '~/constants/routes.json';
import TransferHandler from './TransferHandler';
import {
    AccountTransactionHandler,
    CreateTransactionInput,
} from '../transactionTypes';
import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import { createScheduledTransferTransaction } from '../transactionHelpers';

type TransactionType = ScheduledTransfer;

const TYPE = 'Scheduled Transfer';

export default class ScheduledTransferHandler
    extends TransferHandler<TransactionType>
    implements
        AccountTransactionHandler<TransactionType, ConcordiumLedgerClient> {
    confirmType(
        transaction: AccountTransaction<TransactionPayload>
    ): TransactionType {
        if (instanceOfScheduledTransfer(transaction)) {
            return transaction;
        }
        throw Error('Invalid transaction type was given as input.');
    }

    creationLocationHandler(currentLocation: string, proposalId: number) {
        switch (currentLocation) {
            case routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION:
                return routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_PICKACCOUNT;
            case routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_PICKACCOUNT:
                return routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_PICKAMOUNT;
            case routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_PICKAMOUNT:
                return routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_PICKRECIPIENT;
            case routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_PICKRECIPIENT:
                return routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_BUILDSCHEDULE;
            case routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_BUILDSCHEDULE:
                return routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_SIGNTRANSACTION;
            case routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_SIGNTRANSACTION:
                return routes.MULTISIGTRANSACTIONS_PROPOSAL_EXISTING_ACCOUNT_TRANSACTION.replace(
                    ':id',
                    `${proposalId}`
                );
            default:
                throw new Error('unknown location');
        }
    }

    createTransaction({
        sender,
        schedule,
        recipient,
    }: Partial<CreateTransactionInput>) {
        if (!sender || !recipient || !schedule) {
            throw new Error(
                `Unexpected Missing input: ${{ sender, schedule, recipient }}`
            );
        }
        return createScheduledTransferTransaction(sender, recipient, schedule);
    }

    title = `Account Transaction | ${TYPE}`;

    type = TYPE;
}
