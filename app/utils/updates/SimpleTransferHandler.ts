import {
    SimpleTransfer,
    AccountTransaction,
    TransactionPayload,
    instanceOfSimpleTransfer,
} from '../types';
import routes from '~/constants/routes.json';
import TransferHandler from './TransferHandler';
import {
    AccountTransactionHandler,
    CreateTransactionInput,
} from '../transactionTypes';
import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import { createSimpleTransferTransaction } from '../transactionHelpers';
import { selectedProposalRoute } from '~/utils/routerHelper';

type TransactionType = SimpleTransfer;

const TYPE = 'Simple Transfer';

export default class SimpleTransferHandler
    extends TransferHandler<TransactionType>
    implements
        AccountTransactionHandler<TransactionType, ConcordiumLedgerClient> {
    confirmType(
        transaction: AccountTransaction<TransactionPayload>
    ): TransactionType {
        if (instanceOfSimpleTransfer(transaction)) {
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
                return routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_SIGNTRANSACTION;
            case routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_SIGNTRANSACTION:
                return selectedProposalRoute(proposalId);
            default:
                throw new Error('unknown location');
        }
    }

    createTransaction({
        sender,
        amount,
        recipient,
    }: Partial<CreateTransactionInput>) {
        if (!sender || !recipient || amount === undefined) {
            throw new Error(
                `Unexpected Missing input: ${{ sender, amount, recipient }}`
            );
        }
        return createSimpleTransferTransaction(sender, amount, recipient);
    }

    title = `Account Transaction | ${TYPE}`;

    type = TYPE;
}
