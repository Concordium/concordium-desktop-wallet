/* eslint-disable import/prefer-default-export */
import { Account, TransactionKindId, TransactionTypes } from './types';
import { findAccountTransactionHandler } from '~/utils/transactionHandlers/HandlerFinder';
import { createProposalRoute } from '~/utils/routerHelper';
import routes from '~/constants/routes.json';

export enum AccountTransactionSubRoutes {
    keys,
    stake,
    restake,
    data,
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
        case TransactionKindId.Update_baker_stake:
            return `${url}/${AccountTransactionSubRoutes.stake}`;
        case TransactionKindId.Remove_baker:
        case TransactionKindId.Update_baker_keys:
            return `${url}/${AccountTransactionSubRoutes.expiry}`;
        case TransactionKindId.Update_baker_restake_earnings:
            return `${url}/${AccountTransactionSubRoutes.restake}`;
        case TransactionKindId.Register_data:
            return `${url}/${AccountTransactionSubRoutes.data}`;
        default:
            throw new Error('unknown transactionKind');
    }
}

export function createTransferWithAccountPathName(
    transactionKind: TransactionKindId
) {
    if (
        isBakerTransaction(transactionKind) ||
        transactionKind === TransactionKindId.Register_data
    ) {
        return getLocationAfterAccounts(
            createProposalRoute(
                TransactionTypes.AccountTransaction,
                transactionKind
            ),
            transactionKind
        );
    }
    const handler = findAccountTransactionHandler(transactionKind);
    return handler.creationLocationHandler(
        routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION
    );
}

export function createTransferWithAccountRoute(
    transactionKind: TransactionKindId,
    account: Account
) {
    return {
        pathname: createTransferWithAccountPathName(transactionKind),
        state: {
            account,
        },
    };
}
