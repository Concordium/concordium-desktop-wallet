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

import SidedRow from '~/components/SidedRow';

interface Props {
    transactionType: TransactionKindId;
    account: Account | undefined;
    identity: Identity | undefined;
    amount: string | undefined;
    schedule: Schedule | undefined;
    recipient: AddressBookEntry | undefined;
}

export default function TransactionProposalDetails({
    identity,
    account,
    amount,
    recipient,
    schedule,
    transactionType,
}: Props) {
    return (
        <>
            <h2>{TransactionKindId[transactionType]}</h2>
            <h2>Identity:</h2>
            <b>{identity ? identity.name : 'Choose an ID on the right'}</b>
            <h2>Account:</h2>
            <b>{account ? account.name : 'Choose an account on the right'}</b>
            <h2>Amount:</h2>
            <b>{amount ? `${getGTUSymbol()} ${amount}` : 'To be determined'}</b>
            <h2>Fee:</h2>
            <b>big dollar</b>
            <h2>Recipient:</h2>
            <b>{recipient ? recipient.name : 'To be determined'}</b>
            <br />
            {recipient ? recipient.note : null}
            {transactionType === TransactionKindId.Transfer_with_schedule ? (
                <>
                    <h2>Release Schedule:</h2>
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
        </>
    );
}
