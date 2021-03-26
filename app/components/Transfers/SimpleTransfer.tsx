import React from 'react';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import { stringify } from '../../utils/JSONHelper';
import routes from '../../constants/routes.json';
import { AddressBookEntry, Account } from '../../utils/types';
import { toMicroUnits } from '../../utils/gtu';
import locations from '../../constants/transferLocations.json';
import { createSimpleTransferTransaction } from '../../utils/transactionHelpers';
import ExternalTransfer from '~/components/Transfers/ExternalTransfer';

interface Props {
    account: Account;
}

/**
 * Controls the flow of creating a simple transfer.
 */
export default function SimpleTransfer({ account }: Props) {
    const dispatch = useDispatch();

    return (
        <ExternalTransfer
            toConfirmTransfer={async (
                amount: string,
                recipient: AddressBookEntry
            ) => {
                if (!recipient) {
                    throw new Error('Unexpected missing recipient');
                }

                const transaction = await createSimpleTransferTransaction(
                    account.address,
                    toMicroUnits(amount),
                    recipient.address
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
                                    recipient,
                                },
                            },
                            transaction: stringify(transaction),
                            account,
                        },
                    })
                );
            }}
            exitFunction={() => dispatch(push(routes.ACCOUNTS))}
            amountHeader="Send funds"
        />
    );
}
