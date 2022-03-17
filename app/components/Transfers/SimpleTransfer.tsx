import React, { useCallback } from 'react';
import { Redirect } from 'react-router';
import { useDispatch } from 'react-redux';
import { push, replace } from 'connected-react-router';
import { stringify } from '../../utils/JSONHelper';
import routes from '../../constants/routes.json';
import {
    AddressBookEntry,
    Account,
    TransactionKindId,
    Fraction,
} from '../../utils/types';
import { ccdToMicroCcd } from '../../utils/ccd';
import {
    createSimpleTransferTransaction,
    createSimpleTransferWithMemoTransaction,
} from '../../utils/transactionHelpers';
import ExternalTransfer from '~/components/Transfers/ExternalTransfer';

import { createTransferWithAccountRoute } from '~/utils/accountRouterHelpers';
import ensureExchangeRateAndNonce from '~/components/Transfers/ensureExchangeRateAndNonce';
import { isMultiSig } from '~/utils/accountHelpers';
import { multiplyFraction } from '~/utils/basicHelpers';

interface Props {
    account: Account;
    exchangeRate: Fraction;
    nonce: bigint;
    disableClose?: boolean;
}

/**
 * Controls the flow of creating a simple transfer.
 */
function SimpleTransfer({
    account,
    exchangeRate,
    nonce,
    disableClose = false,
}: Props) {
    const dispatch = useDispatch();

    const toConfirmTransfer = useCallback(
        async (amount: string, recipient: AddressBookEntry, memo?: string) => {
            if (!recipient) {
                throw new Error('Unexpected missing recipient');
            }

            let transaction;
            if (memo) {
                transaction = await createSimpleTransferWithMemoTransaction(
                    account.address,
                    ccdToMicroCcd(amount),
                    recipient.address,
                    nonce,
                    memo
                );
            } else {
                transaction = await createSimpleTransferTransaction(
                    account.address,
                    ccdToMicroCcd(amount),
                    recipient.address,
                    nonce
                );
            }

            transaction.estimatedFee = multiplyFraction(
                exchangeRate,
                transaction.energyAmount
            );

            dispatch(
                replace(routes.ACCOUNTS_SIMPLETRANSFER, {
                    amount,
                    memo,
                    recipient,
                })
            );
            dispatch(
                push({
                    pathname: routes.SUBMITTRANSFER,
                    state: {
                        confirmed: {
                            pathname: routes.ACCOUNTS_FINAL_PAGE,
                            state: {
                                transaction: stringify(transaction),
                                recipient,
                            },
                        },
                        transaction: stringify(transaction),
                        account,
                    },
                })
            );
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [JSON.stringify(account)]
    );

    if (isMultiSig(account)) {
        return (
            <Redirect
                to={createTransferWithAccountRoute(
                    TransactionKindId.Simple_transfer,
                    account
                )}
            />
        );
    }

    return (
        <ExternalTransfer
            exchangeRate={exchangeRate}
            toConfirmTransfer={toConfirmTransfer}
            exitFunction={
                disableClose ? undefined : () => dispatch(push(routes.ACCOUNTS))
            }
            amountHeader="Send CCD"
            senderAddress={account.address}
            transactionKind={TransactionKindId.Simple_transfer}
        />
    );
}

export default ensureExchangeRateAndNonce(SimpleTransfer);
