import React, { useCallback } from 'react';
import { Redirect } from 'react-router';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import { stringify } from '../../utils/JSONHelper';
import routes from '../../constants/routes.json';
import {
    AddressBookEntry,
    Account,
    TransactionKindId,
    Fraction,
} from '../../utils/types';
import { toMicroUnits } from '../../utils/gtu';
import locations from '../../constants/transferLocations.json';
import { createSimpleTransferTransaction } from '../../utils/transactionHelpers';
import ExternalTransfer from '~/components/Transfers/ExternalTransfer';

import { createTransferWithAccountRoute } from '~/utils/accountRouterHelpers';
import ensureExchangeRateAndNonce from '~/components/Transfers/ensureExchangeRateAndNonce';
import { isMultiSig } from '~/utils/accountHelpers';
import { multiplyFraction } from '~/utils/basicHelpers';

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

    const toConfirmTransfer = useCallback(
        async (amount: string, recipient: AddressBookEntry, memo?: string) => {
            if (!recipient) {
                throw new Error('Unexpected missing recipient');
            }

            const transaction = await createSimpleTransferTransaction(
                account.address,
                toMicroUnits(amount),
                recipient.address,
                nonce,
                memo
            );
            transaction.estimatedFee = multiplyFraction(
                exchangeRate,
                transaction.energyAmount
            );

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
                                memo,
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
            exitFunction={() => dispatch(push(routes.ACCOUNTS))}
            amountHeader="Send GTU"
            senderAddress={account.address}
            transactionKind={TransactionKindId.Simple_transfer}
        />
    );
}

export default ensureExchangeRateAndNonce(SimpleTransfer);
