import React from 'react';
import { Header, Grid, Button } from 'semantic-ui-react';
import { AccountInfo, ScheduleItem, TimeStampUnit } from '../../utils/types';
import { parseTime } from '../../utils/timeHelpers';
import { displayAsGTU } from '../../utils/gtu';
import SidedText from '../../components/SidedText';

interface Props {
    accountInfo: AccountInfo;
    returnFunction(): void;
}
/**
 * Displays the account's release schedule:
 * Each release (amount and time)
 * and the total locked value.
 */
export default function ShowReleaseSchedule({
    accountInfo,
    returnFunction,
}: Props) {
    return (
        <>
            <Button onClick={returnFunction}>x</Button>
            <Header textAlign="center">Release schedule</Header>
            <Grid container columns={2} divided="vertically">
                <SidedText left="Release Time:" right="Amount:" />
                {accountInfo.accountReleaseSchedule.schedule.map(
                    (item: ScheduleItem) => (
                        <SidedText
                            key={item.timestamp}
                            left={parseTime(
                                item.timestamp,
                                TimeStampUnit.milliSeconds
                            )}
                            right={displayAsGTU(item.amount)}
                        />
                    )
                )}
                <SidedText
                    left="Total:"
                    right={displayAsGTU(
                        accountInfo.accountReleaseSchedule.total
                    )}
                />
            </Grid>
        </>
    );
}
