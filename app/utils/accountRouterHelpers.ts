/* eslint-disable import/prefer-default-export */
import { Account, TransactionKindId, TransactionTypes } from './types';
import { findAccountTransactionHandler } from '~/utils/transactionHandlers/HandlerFinder';
import { createProposalRoute } from '~/utils/routerHelper';
import routes from '~/constants/routes.json';
import { getLocationAfterAccounts } from '~/pages/multisig/AccountTransactions/AddBaker';

export function createTransferWithAccountRoute(
    transactionKind: TransactionKindId,
    account: Account
) {
    let pathname;

    if (transactionKind === TransactionKindId.Add_baker) {
        pathname = getLocationAfterAccounts(
            createProposalRoute(
                TransactionTypes.AccountTransaction,
                transactionKind
            )
        );
    } else {
        const handler = findAccountTransactionHandler(transactionKind);
        pathname = handler.creationLocationHandler(
            routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_PICKACCOUNT
        );
    }

    return {
        pathname,
        state: {
            account,
        },
    };
}
