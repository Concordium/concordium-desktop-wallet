import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import { useLocation } from 'react-router-dom';
import { stringify } from '~/utils/JSONHelper';
import routes from '~/constants/routes.json';
import PickAmount from './PickAmount';
import FinalPage from './FinalPage';
import {
    Account,
    TransferToEncrypted,
    TransferToPublic,
    TransactionKindId,
    Fraction,
} from '~/utils/types';
import { toMicroUnits } from '~/utils/gtu';
import locations from '~/constants/transferLocations.json';
import { TransferState } from '~/utils/transactionTypes';
import { getTransactionKindCost } from '~/utils/transactionCosts';
import SimpleErrorModal from '~/components/SimpleErrorModal';
import TransferView from './TransferView';
import ensureExchangeRateAndNonce from '~/components/Transfers/ensureExchangeRateAndNonce';

interface Specific<T> {
    amountHeader: string;
    createTransaction: (address: string, amount: bigint, nonce: string) => T;
    location: string;
    transactionKind: TransactionKindId;
}

interface Props<T> {
    account: Account;
    specific: Specific<T>;
    exchangeRate: Fraction;
    nonce: string;
}

/**
 * Controls the flow of creating a TransferToEncrypted/TransferToPublic transfer.
 */
function InternalTransfer<
T extends TransferToPublic | TransferToEncrypted
>({ account, specific, exchangeRate, nonce }: Props<T>) {
    const dispatch = useDispatch();
    const location = useLocation<TransferState>();

    const [error, setError] = useState<string | undefined>();
    const [estimatedFee, setEstimatedFee] = useState<Fraction | undefined>();

    useEffect(() => {
        getTransactionKindCost(specific.transactionKind, exchangeRate)
            .then((transferCost) => setEstimatedFee(transferCost))
            .catch((e) =>
                setError(`Unable to get transaction cost due to: ${e}`)
            );
    }, [specific.transactionKind, setEstimatedFee]);

    const [subLocation, setSubLocation] = useState<string>(
        location?.state?.initialPage || locations.pickAmount
    );

    const toConfirmTransfer = useCallback(
        async (amount: string) => {
            const transaction = await specific.createTransaction(
                account.address,
                toMicroUnits(amount),
                nonce
            );
            transaction.estimatedFee = estimatedFee;

            const transactionJSON = stringify(transaction);
            dispatch(
                push({
                    pathname: routes.SUBMITTRANSFER,
                    state: {
                        confirmed: {
                            pathname: specific.location,
                            state: {
                                initialPage: locations.transferSubmitted,
                                transaction: transactionJSON,
                            },
                        },
                        cancelled: {
                            pathname: specific.location,
                            state: {
                                initialPage: locations.pickAmount,
                                amount,
                            },
                        },
                        transaction: transactionJSON,
                        account,
                    },
                })
            );
        },
        [specific, account, estimatedFee, dispatch]
    );

    return (
        <>
            <SimpleErrorModal
                show={Boolean(error)}
                content={error}
                onClick={() => dispatch(push(routes.ACCOUNTS))}
            />
            <TransferView
                showBack={subLocation === locations.confirmTransfer}
                exitOnClick={() => dispatch(push(routes.ACCOUNTS))}
                backOnClick={() => setSubLocation(locations.pickAmount)}
            >
                {subLocation === locations.pickAmount && (
                    <PickAmount
                        header={specific.amountHeader}
                        estimatedFee={estimatedFee}
                        defaultAmount={location?.state?.amount ?? ''}
                        toPickRecipient={undefined}
                        toConfirmTransfer={toConfirmTransfer}
                        transactionKind={specific.transactionKind}
                    />
                )}
                {subLocation === locations.transferSubmitted && (
                    <FinalPage location={location} />
                )}
            </TransferView>
        </>
    );
}

export default ensureExchangeRateAndNonce(InternalTransfer);
