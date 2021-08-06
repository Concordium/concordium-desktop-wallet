/* eslint-disable import/prefer-default-export */
import { AccountTransactionType } from '@concordium/node-sdk';
import { Account, TransactionTypes } from './types';
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

function isBakerTransaction(transactionKind: AccountTransactionType) {
    switch (transactionKind) {
        case AccountTransactionType.AddBaker:
        case AccountTransactionType.RemoveBaker:
        case AccountTransactionType.UpdateBakerKeys:
        case AccountTransactionType.UpdateBakerStake:
        case AccountTransactionType.UpdateBakerRestakeEarnings:
            return true;
        default:
            return false;
    }
}

export function getLocationAfterAccounts(
    url: string,
    transactionKind: AccountTransactionType
) {
    switch (transactionKind) {
        case AccountTransactionType.AddBaker:
            return `${url}/${BakerSubRoutes.stake}`;
        case AccountTransactionType.RemoveBaker:
        case AccountTransactionType.UpdateBakerKeys:
            return `${url}/${BakerSubRoutes.expiry}`;
        case AccountTransactionType.UpdateBakerStake:
            return `${url}/${BakerSubRoutes.stake}`;
        case AccountTransactionType.UpdateBakerRestakeEarnings:
            return `${url}/${BakerSubRoutes.restake}`;
        default:
            throw new Error('unknown transactionKind');
    }
}

export function createTransferWithAccountPathName(
    transactionKind: AccountTransactionType
) {
    if (isBakerTransaction(transactionKind)) {
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
    transactionKind: AccountTransactionType,
    account: Account
) {
    return {
        pathname: createTransferWithAccountPathName(transactionKind),
        state: {
            account,
        },
    };
}
