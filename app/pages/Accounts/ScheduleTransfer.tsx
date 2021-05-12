import React from 'react';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import { Account, AddressBookEntry } from '~/utils/types';
import routes from '~/constants/routes.json';
import { toMicroUnits } from '~/utils/gtu';
import ExternalTransfer from '~/components/Transfers/ExternalTransfer';

interface Props {
    account: Account;
    returnFunction(): void;
}

/**
 * Controls the flow of creating a scheduled transfer.
 */
export default function ScheduleTransfer({ account, returnFunction }: Props) {
    const dispatch = useDispatch();

    function toBuildSchedule(amount: string, recipient: AddressBookEntry) {
        dispatch(
            push({
                pathname: routes.ACCOUNTS_SCHEDULED_TRANSFER,
                state: {
                    account,
                    amount: toMicroUnits(amount).toString(),
                    recipient,
                },
            })
        );
    }

    return (
        <ExternalTransfer
            toConfirmTransfer={toBuildSchedule}
            exitFunction={returnFunction}
            amountHeader="Send GTU with a schedule"
            senderAddress={account.address}
        />
    );
}
