import React from 'react';
import {
    Account,
    AddressBookEntry,
    TransactionKindId,
    Schedule,
    Fraction,
} from '~/utils/types';
import DisplayEstimatedFee from '~/components/DisplayEstimatedFee';
import ScheduleList from '~/components/ScheduleList';
import { AccountDetail, AmountDetail, Details, PlainDetail } from './shared';
import DisplayTransactionExpiryTime from '~/components/DisplayTransactionExpiryTime/DisplayTransactionExpiryTime';
import DisplayMemo from '~/components/DisplayMemo';

interface Props {
    transactionType:
        | TransactionKindId.Simple_transfer
        | TransactionKindId.Transfer_with_schedule;
    account?: Account;
    amount?: string;
    recipient?: AddressBookEntry;
    memo?: string;
    schedule?: Schedule;
    estimatedFee?: Fraction;
    expiryTime?: Date;
    amountError?: string;
}

export default function TransferProposalDetails({
    account,
    amount,
    recipient,
    memo,
    schedule,
    transactionType,
    estimatedFee,
    expiryTime,
    amountError,
}: Props) {
    const isScheduledTransfer =
        transactionType === TransactionKindId.Transfer_with_schedule;

    return (
        <Details>
            <AccountDetail title="Account" value={account} first />
            <AmountDetail title="Amount" value={amount} />
            <DisplayEstimatedFee className="mT5" estimatedFee={estimatedFee} />
            {Boolean(amountError) && (
                <p className="textError textCenter">{amountError}</p>
            )}
            <DisplayMemo memo={memo} fallback="Optional" />
            <AccountDetail title="Recipient" value={recipient} />
            {isScheduledTransfer ? (
                <PlainDetail
                    title="Release Schedule"
                    value={schedule}
                    format={(s) => <ScheduleList schedule={s} />}
                />
            ) : null}
            <DisplayTransactionExpiryTime expiryTime={expiryTime} />
            <br />
        </Details>
    );
}
