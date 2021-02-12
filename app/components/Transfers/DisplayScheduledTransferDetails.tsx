import React from 'react';
import { List, Grid } from 'semantic-ui-react';
import {
    ScheduledTransfer,
    SchedulePoint,
    TimeStampUnit,
} from '../../utils/types';
import { parseTime } from '../../utils/timeHelpers';
import { displayAsGTU } from '../../utils/gtu';
import SidedText from '../SidedText';

interface Props {
    transaction: ScheduledTransfer;
    fromName?: string;
    toName?: string;
}

/**
 * Displays an overview of a scheduledTransfer.
 */
export default function Display({ transaction, fromName, toName }: Props) {
    const amount = transaction.payload.schedule.reduce(
        (total, point) => total + BigInt(point.amount),
        0n
    );

    return (
        <List>
            <List.Item>
                From Account: {fromName} {transaction.sender}
            </List.Item>
            <List.Item>
                To Account: {toName} {transaction.payload.toAddress}
            </List.Item>
            <List.Item>Total Amount: {displayAsGTU(amount)}</List.Item>
            <List.Item>
                <Grid container columns={2}>
                    {transaction.payload.schedule.map((item: SchedulePoint) => (
                        <SidedText
                            key={item.timestamp}
                            left={parseTime(
                                item.timestamp,
                                TimeStampUnit.milliSeconds
                            )}
                            right={displayAsGTU(item.amount)}
                        />
                    ))}
                </Grid>
            </List.Item>
        </List>
    );
}
