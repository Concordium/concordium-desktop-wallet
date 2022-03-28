import React, { useMemo, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { push, replace } from 'connected-react-router';
import { useLocation } from 'react-router-dom';
import { stringify } from '~/utils/JSONHelper';
import routes from '~/constants/routes.json';
import PickAmount from './PickAmount';
import {
    Account,
    TransferToEncrypted,
    TransferToPublic,
    TransactionKindId,
    Fraction,
} from '~/utils/types';
import { ccdToMicroCcd } from '~/utils/ccd';
import { TransferState } from '~/utils/transactionTypes';
import { getTransactionKindCost } from '~/utils/transactionCosts';
import TransferView from './TransferView';
import ensureExchangeRateAndNonce from '~/components/Transfers/ensureExchangeRateAndNonce';

interface Specific<T> {
    amountHeader: string;
    createTransaction: (address: string, amount: bigint, nonce: bigint) => T;
    location: string;
    transactionKind: TransactionKindId;
}

interface Props<T> {
    account: Account;
    specific: Specific<T>;
    exchangeRate: Fraction;
    nonce: bigint;
    disableClose?: boolean;
}

/**
 * Controls the flow of creating a TransferToEncrypted/TransferToPublic transfer.
 */
function InternalTransfer<T extends TransferToPublic | TransferToEncrypted>({
    account,
    specific,
    exchangeRate,
    nonce,
    disableClose = false,
}: Props<T>) {
    const dispatch = useDispatch();
    const location = useLocation<TransferState>();

    const estimatedFee = useMemo(
        () => getTransactionKindCost(specific.transactionKind, exchangeRate),
        [specific.transactionKind, exchangeRate]
    );

    const toConfirmTransfer = useCallback(
        async (amount: string) => {
            const transaction = await specific.createTransaction(
                account.address,
                ccdToMicroCcd(amount),
                nonce
            );
            transaction.estimatedFee = estimatedFee;

            const transactionJSON = stringify(transaction);

            dispatch(replace(specific.location, { amount }));
            dispatch(
                push({
                    pathname: routes.SUBMITTRANSFER,
                    state: {
                        confirmed: {
                            pathname: routes.ACCOUNTS_FINAL_PAGE,
                            state: {
                                transaction: transactionJSON,
                            },
                        },
                        transaction: transactionJSON,
                        account,
                    },
                })
            );
        },
        [specific, account, estimatedFee, dispatch, nonce]
    );

    return (
        <TransferView
            showBack={false}
            exitOnClick={
                disableClose ? undefined : () => dispatch(push(routes.ACCOUNTS))
            }
        >
            <PickAmount
                header={specific.amountHeader}
                estimatedFee={estimatedFee}
                defaultAmount={location?.state?.amount ?? ''}
                toPickRecipient={undefined}
                toConfirmTransfer={toConfirmTransfer}
                transactionKind={specific.transactionKind}
            />
        </TransferView>
    );
}

export default ensureExchangeRateAndNonce(InternalTransfer);
