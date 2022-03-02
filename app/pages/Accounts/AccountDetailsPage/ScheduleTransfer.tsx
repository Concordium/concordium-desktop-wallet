import React from 'react';
import { Redirect } from 'react-router';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import {
    TransactionKindId,
    Account,
    AddressBookEntry,
    Fraction,
} from '~/utils/types';
import routes from '~/constants/routes.json';
import { toMicroUnits } from '~/utils/ccd';
import { stringify } from '~/utils/JSONHelper';
import ExternalTransfer from '~/components/Transfers/ExternalTransfer';
import ensureExchangeRateAndNonce from '~/components/Transfers/ensureExchangeRateAndNonce';
import { createTransferWithAccountRoute } from '~/utils/accountRouterHelpers';
import { isMultiSig } from '~/utils/accountHelpers';

interface Props {
    account: Account;
    exchangeRate: Fraction;
    nonce: bigint;
}

/**
 * Controls the flow of creating a scheduled transfer.
 */
function ScheduleTransfer({ account, exchangeRate, nonce }: Props) {
    const dispatch = useDispatch();

    if (isMultiSig(account)) {
        return (
            <Redirect
                to={createTransferWithAccountRoute(
                    TransactionKindId.Transfer_with_schedule,
                    account
                )}
            />
        );
    }

    function toBuildSchedule(
        amount: string,
        recipient: AddressBookEntry,
        memo?: string
    ) {
        dispatch(
            push({
                pathname: routes.ACCOUNTS_SCHEDULED_TRANSFER,
                state: {
                    account,
                    nonce: stringify(nonce),
                    memo,
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
            amountHeader="Send CCD with a schedule"
            senderAddress={account.address}
            transactionKind={TransactionKindId.Simple_transfer}
        />
    );
}

export default ensureExchangeRateAndNonce(ScheduleTransfer);
