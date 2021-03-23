import React from 'react';
import { Grid } from 'semantic-ui-react';
import {
    Account,
    Identity,
    AddressBookEntry,
    TransactionKindId,
    SchedulePoint,
    TimeStampUnit,
    Schedule,
} from '~/utils/types';
import { getGTUSymbol, displayAsGTU } from '~/utils/gtu';
import { parseTime } from '~/utils/timeHelpers';
import styles from './MultisignatureAccountTransactions.module.scss';

import SidedRow from '~/components/SidedRow';

interface Props {
    transactionType: TransactionKindId;
    account: Account | undefined;
    identity: Identity | undefined;
    amount: string | undefined;
    schedule: Schedule | undefined;
    recipient: AddressBookEntry | undefined;
}

const placeholderText = 'To be determined';

function getScheduledTransferCost(schedule: Schedule) {
    return 364n * BigInt(schedule.length);
}

// TODO make an actual function for this;
function getTransactionCost(type: TransactionKindId) {
    if (type) {
        return 100n;
    }
    return 200n;
}

export default function TransactionProposalDetails({
    identity,
    account,
    amount,
    recipient,
    schedule,
    transactionType,
}: Props) {
    const isScheduledTransfer =
        transactionType === TransactionKindId.Transfer_with_schedule;
    let fee;
    if (isScheduledTransfer) {
        fee = schedule ? getScheduledTransferCost(schedule) : null;
    } else {
        fee = getTransactionCost(transactionType);
    }
    return (
        <div className={styles.details}>
            <b>Identity:</b>
            <h2>{identity ? identity.name : placeholderText}</h2>
            <b>Account:</b>
            <h2>{account ? account.name : placeholderText}</h2>
            <b>Amount:</b>
            <h2>{amount ? `${getGTUSymbol()} ${amount}` : placeholderText}</h2>
            <b>Estimated Fee: {fee ? displayAsGTU(fee) : null}</b>
            <br />
            <br />
            <b>Recipient:</b>
            <h2>{recipient ? recipient.name : 'To be determined'}</h2>
            {recipient ? `Note: ${recipient.note}` : null}
            <br />
            <br />
            {isScheduledTransfer ? (
                <>
                    <b>Release Schedule:</b>
                    {schedule ? (
                        <>
                            <Grid container columns={2}>
                                {schedule.map((item: SchedulePoint) => (
                                    <SidedRow
                                        key={item.timestamp}
                                        left={parseTime(
                                            item.timestamp,
                                            TimeStampUnit.milliSeconds
                                        )}
                                        right={displayAsGTU(item.amount)}
                                    />
                                ))}
                            </Grid>
                        </>
                    ) : (
                        'To be determined'
                    )}
                </>
            ) : null}
            <br />
        </div>
    );
}
