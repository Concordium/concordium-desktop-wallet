/* eslint-disable import/prefer-default-export */
import { Account, TransactionKindId, TransactionTypes } from './types';
import { findAccountTransactionHandler } from '~/utils/transactionHandlers/HandlerFinder';
import { createProposalRoute } from '~/utils/routerHelper';
import routes from '~/constants/routes.json';
import { getLocationAfterAccounts as addBakerLocation } from '~/pages/multisig/AccountTransactions/AddBaker';
import { getLocationAfterAccounts as removeBakerLocation } from '~/pages/multisig/AccountTransactions/RemoveBaker';
import { getLocationAfterAccounts as updateBakerKeysLocation } from '~/pages/multisig/AccountTransactions/UpdateBakerKeys';
import { getLocationAfterAccounts as updateBakerStakeLocation } from '~/pages/multisig/AccountTransactions/UpdateBakerStake';
import { getLocationAfterAccounts as updateBakerRestakeLocation } from '~/pages/multisig/AccountTransactions/UpdateBakerRestakeEarnings';

export function createTransferWithAccountRoute(
    transactionKind: TransactionKindId,
    account: Account
) {
    let pathname;

    if (transactionKind === TransactionKindId.Add_baker) {
        pathname = addBakerLocation(
            createProposalRoute(
                TransactionTypes.AccountTransaction,
                transactionKind
            )
        );
    } else if (transactionKind === TransactionKindId.Remove_baker) {
        pathname = removeBakerLocation(
            createProposalRoute(
                TransactionTypes.AccountTransaction,
                transactionKind
            )
        );
    } else if (transactionKind === TransactionKindId.Update_baker_keys) {
        pathname = updateBakerKeysLocation(
            createProposalRoute(
                TransactionTypes.AccountTransaction,
                transactionKind
            )
        );
    } else if (transactionKind === TransactionKindId.Update_baker_stake) {
        pathname = updateBakerStakeLocation(
            createProposalRoute(
                TransactionTypes.AccountTransaction,
                transactionKind
            )
        );
    } else if (
        transactionKind === TransactionKindId.Update_baker_restake_earnings
    ) {
        pathname = updateBakerRestakeLocation(
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
