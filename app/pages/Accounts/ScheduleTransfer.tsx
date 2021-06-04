import React from 'react';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import {
    TransactionKindId,
    Account,
    AddressBookEntry,
    Fraction,
} from '~/utils/types';
import routes from '~/constants/routes.json';
import { toMicroUnits } from '~/utils/gtu';
import { stringify } from '~/utils/JSONHelper';
import ExternalTransfer from '~/components/Transfers/ExternalTransfer';
import ensureExchangeRateAndNonce from '~/components/Transfers/ensureExchangeRateAndNonce';

interface Props {
    account: Account;
    returnFunction(): void;
    exchangeRate: Fraction;
    nonce: string;
}

/**
 * Controls the flow of creating a scheduled transfer.
 */
function ScheduleTransfer({
    account,
    returnFunction,
    exchangeRate,
    nonce,
}: Props) {
    const dispatch = useDispatch();

    function toBuildSchedule(amount: string, recipient: AddressBookEntry) {
        dispatch(
            push({
                pathname: routes.ACCOUNTS_SCHEDULED_TRANSFER,
                state: {
                    account,
                    nonce,
                    amount: toMicroUnits(amount).toString(),
                    recipient,
                    exchangeRate: stringify(exchangeRate),
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
            transactionKind={TransactionKindId.Simple_transfer}
        />
    );
}

export default ensureExchangeRateAndNonce(ScheduleTransfer);
