import React, { useMemo, useCallback } from 'react';
import { Redirect } from 'react-router';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import { AccountTransactionType } from '@concordium/node-sdk/lib/src/types';
import { stringify } from '../../utils/JSONHelper';
import routes from '../../constants/routes.json';
import { AddressBookEntry, Account, Fraction } from '../../utils/types';
import { toMicroUnits } from '../../utils/gtu';
import locations from '../../constants/transferLocations.json';
import { createSimpleTransferTransaction } from '../../utils/transactionHelpers';
import ExternalTransfer from '~/components/Transfers/ExternalTransfer';

import { createTransferWithAccountRoute } from '~/utils/accountRouterHelpers';
import { getTransactionKindCost } from '~/utils/transactionCosts';
import ensureExchangeRateAndNonce from '~/components/Transfers/ensureExchangeRateAndNonce';
import { isMultiSig } from '~/utils/accountHelpers';

interface Props {
    account: Account;
    exchangeRate: Fraction;
    nonce: string;
}

/**
 * Controls the flow of creating a simple transfer.
 */
function SimpleTransfer({ account, exchangeRate, nonce }: Props) {
    const dispatch = useDispatch();

    const estimatedFee = useMemo(
        () =>
            getTransactionKindCost(
                AccountTransactionType.SimpleTransfer,
                exchangeRate
            ),
        [exchangeRate]
    );

    const toConfirmTransfer = useCallback(
        async (amount: string, recipient: AddressBookEntry) => {
            if (!recipient) {
                throw new Error('Unexpected missing recipient');
            }

            const transaction = await createSimpleTransferTransaction(
                account.address,
                toMicroUnits(amount),
                recipient.address,
                nonce
            );
            transaction.estimatedFee = estimatedFee;

            dispatch(
                push({
                    pathname: routes.SUBMITTRANSFER,
                    state: {
                        confirmed: {
                            pathname: routes.ACCOUNTS_SIMPLETRANSFER,
                            state: {
                                initialPage: locations.transferSubmitted,
                                transaction: stringify(transaction),
                                recipient,
                            },
                        },
                        cancelled: {
                            pathname: routes.ACCOUNTS_SIMPLETRANSFER,
                            state: {
                                initialPage: locations.pickAmount,
                                amount,
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
        [JSON.stringify(account), estimatedFee]
    );

    if (isMultiSig(account)) {
        return (
            <Redirect
                to={createTransferWithAccountRoute(
                    AccountTransactionType.SimpleTransfer,
                    account
                )}
            />
        );
    }

    return (
        <ExternalTransfer
            estimatedFee={estimatedFee}
            toConfirmTransfer={toConfirmTransfer}
            exitFunction={() => dispatch(push(routes.ACCOUNTS))}
            amountHeader="Send GTU"
            senderAddress={account.address}
            transactionKind={AccountTransactionType.SimpleTransfer}
        />
    );
}

export default ensureExchangeRateAndNonce(SimpleTransfer);
