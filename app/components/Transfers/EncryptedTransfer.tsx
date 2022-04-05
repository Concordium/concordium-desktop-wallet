import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { push, replace } from 'connected-react-router';
import { stringify } from '~/utils/JSONHelper';
import routes from '~/constants/routes.json';
import {
    AddressBookEntry,
    Account,
    TransactionKindId,
    Fraction,
} from '~/utils/types';
import { ccdToMicroCcd } from '~/utils/ccd';
import { createEncryptedTransferTransaction } from '~/utils/transactionHelpers';
import ExternalTransfer from '~/components/Transfers/ExternalTransfer';
import { multiplyFraction } from '~/utils/basicHelpers';

import ensureExchangeRateAndNonce from './ensureExchangeRateAndNonce';
import ensureNoPendingShieldedBalance from './ensureNoPendingShieldedBalance';

interface Props {
    account: Account;
    exchangeRate: Fraction;
    nonce: bigint;
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

    const toConfirmTransfer = useCallback(
        async (amount: string, recipient: AddressBookEntry, memo?: string) => {
            if (!recipient) {
                throw new Error('Unexpected missing recipient');
            }

            const transaction = await createEncryptedTransferTransaction(
                account.address,
                ccdToMicroCcd(amount),
                recipient.address,
                nonce,
                memo
            );
            transaction.estimatedFee = multiplyFraction(
                exchangeRate,
                transaction.energyAmount
            );

            dispatch(
                replace(routes.ACCOUNTS_ENCRYPTEDTRANSFER, {
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

    return (
        <ExternalTransfer
            exchangeRate={exchangeRate}
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

export default ensureExchangeRateAndNonce(
    ensureNoPendingShieldedBalance(EncryptedTransfer)
);
