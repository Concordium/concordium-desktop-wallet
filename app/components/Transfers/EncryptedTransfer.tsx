import React, { useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import { stringify } from '~/utils/JSONHelper';
import routes from '~/constants/routes.json';
import {
    AddressBookEntry,
    Account,
    TransactionKindId,
    Fraction,
} from '~/utils/types';
import { toMicroUnits } from '~/utils/gtu';
import locations from '~/constants/transferLocations.json';
import { createEncryptedTransferTransaction } from '~/utils/transactionHelpers';
import ExternalTransfer from '~/components/Transfers/ExternalTransfer';

import { getTransactionKindCost } from '~/utils/transactionCosts';
import ensureExchangeRateAndNonce from '~/components/Transfers/ensureExchangeRateAndNonce';

interface Props {
    account: Account;
    exchangeRate: Fraction;
    nonce: string;
    disableClose?: boolean;
}

/**
 * Controls the flow of creating an encrypted transfer.
 */
function EncryptedTransfer({
    account,
    exchangeRate,
    nonce,
    disableClose = false,
}: Props) {
    const dispatch = useDispatch();

    const estimatedFee = useMemo(
        () =>
            getTransactionKindCost(
                TransactionKindId.Encrypted_transfer,
                exchangeRate
            ),
        [exchangeRate]
    );

    const toConfirmTransfer = useCallback(
        async (amount: string, recipient: AddressBookEntry) => {
            if (!recipient) {
                throw new Error('Unexpected missing recipient');
            }

            const transaction = await createEncryptedTransferTransaction(
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
                            pathname: routes.ACCOUNTS_ENCRYPTEDTRANSFER,
                            state: {
                                initialPage: locations.transferSubmitted,
                                transaction: stringify(transaction),
                                recipient,
                            },
                        },
                        cancelled: {
                            pathname: routes.ACCOUNTS_ENCRYPTEDTRANSFER,
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
        [JSON.stringify(account), estimatedFee, nonce]
    );

    return (
        <ExternalTransfer
            estimatedFee={estimatedFee}
            toConfirmTransfer={toConfirmTransfer}
            exitFunction={
                disableClose ? undefined : () => dispatch(push(routes.ACCOUNTS))
            }
            amountHeader="Send shielded funds"
            senderAddress={account.address}
            transactionKind={TransactionKindId.Encrypted_transfer}
        />
    );
}

export default ensureExchangeRateAndNonce(EncryptedTransfer);
