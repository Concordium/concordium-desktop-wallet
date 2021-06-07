/* eslint-disable import/prefer-default-export */
import { Account, TransactionKindId } from './types';
import { findAccountTransactionHandler } from '~/utils/transactionHandlers/HandlerFinder';
import routes from '~/constants/routes.json';

export function createTransferWithAccountRoute(
    transactionKind: TransactionKindId,
    account: Account
) {
    const handler = findAccountTransactionHandler(transactionKind);
    const pathname = handler.creationLocationHandler(
        routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_PICKACCOUNT
    );

    return {
        pathname,
        state: {
            account,
        },
    };
}
