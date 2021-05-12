import React, { useState, useEffect, useCallback } from 'react';
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

import { getTransactionKindCost } from '~/utils/transactionCosts';
import SimpleErrorModal from '~/components/SimpleErrorModal';

interface Props {
    account: Account;
}

/**
 * Controls the flow of creating a simple transfer.
 */
export default function SimpleTransfer({ account }: Props) {
    const dispatch = useDispatch();

    const [error, setError] = useState<string | undefined>();
    const [estimatedFee, setEstimatedFee] = useState<Fraction | undefined>();

    useEffect(() => {
        getTransactionKindCost(TransactionKindId.Simple_transfer)
            .then((transferCost) => setEstimatedFee(transferCost))
            .catch((e) =>
                setError(`Unable to get transaction cost due to: ${e}`)
            );
    }, [setEstimatedFee]);

    const toConfirmTransfer = useCallback(
        async (amount: string, recipient: AddressBookEntry) => {
            if (!recipient) {
                throw new Error('Unexpected missing recipient');
            }

            const transaction = await createSimpleTransferTransaction(
                account.address,
                toMicroUnits(amount),
                recipient.address
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

    return (
        <>
            <SimpleErrorModal
                show={Boolean(error)}
                content={error}
                onClick={() => dispatch(push(routes.ACCOUNTS))}
            />
            <ExternalTransfer
                estimatedFee={estimatedFee}
                toConfirmTransfer={toConfirmTransfer}
                exitFunction={() => dispatch(push(routes.ACCOUNTS))}
                amountHeader="Send GTU"
            />
        </>
    );
}
