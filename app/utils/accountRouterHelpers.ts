/* eslint-disable import/prefer-default-export */
import { Account, TransactionKindId, TransactionTypes } from './types';
import { findAccountTransactionHandler } from '~/utils/transactionHandlers/HandlerFinder';
import { createProposalRoute } from '~/utils/routerHelper';
import routes from '~/constants/routes.json';

export enum BakerSubRoutes {
    keys,
    stake,
    restake,
    expiry,
    sign,
}

function isBakerTransaction(transactionKind: TransactionKindId) {
    switch (transactionKind) {
        case TransactionKindId.Add_baker:
        case TransactionKindId.Remove_baker:
        case TransactionKindId.Update_baker_keys:
        case TransactionKindId.Update_baker_stake:
        case TransactionKindId.Update_baker_restake_earnings:
            return true;
        default:
            return false;
    }
}

export function getLocationAfterAccounts(
    url: string,
    transactionKind: TransactionKindId
) {
    switch (transactionKind) {
        case TransactionKindId.Add_baker:
            return `${url}/${BakerSubRoutes.stake}`;
        case TransactionKindId.Remove_baker:
        case TransactionKindId.Update_baker_keys:
            return `${url}/${BakerSubRoutes.expiry}`;
        case TransactionKindId.Update_baker_stake:
            return `${url}/${BakerSubRoutes.stake}`;
        case TransactionKindId.Update_baker_restake_earnings:
            return `${url}/${BakerSubRoutes.restake}`;
        default:
            throw new Error('unknown transactionKind');
    }
}

export function createTransferWithAccountRoute(
    transactionKind: TransactionKindId,
    account: Account
) {
    let pathname;
    if (isBakerTransaction(transactionKind)) {
        pathname = getLocationAfterAccounts(
            createProposalRoute(
                TransactionTypes.AccountTransaction,
                transactionKind
            ),
            transactionKind
        );
    } else {
        const handler = findAccountTransactionHandler(transactionKind);
        pathname = handler.creationLocationHandler(
            routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION
        );
    }

    return {
        pathname,
        state: {
            account,
        },
    };
}
