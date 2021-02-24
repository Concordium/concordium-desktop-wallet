import React, { useState } from 'react';
import { Label, List, Button, Input } from 'semantic-ui-react';
import { Schedule } from '../../utils/types';
import { createRegularIntervalSchedule } from '../../utils/transactionHelpers';
import InputTimeStamp from '../../components/InputTimeStamp';
import { TimeConstants, getNow } from '../../utils/timeHelpers';

export interface Interval {
    label: string;
    value: number;
}
export const intervals: Interval[] = [
    { label: 'Minute', value: TimeConstants.Minute },
    { label: 'Hour', value: TimeConstants.Hour },
    { label: 'Day', value: TimeConstants.Day },
    { label: 'Week', value: TimeConstants.Week },
    { label: 'Month (30 days)', value: TimeConstants.Month },
];

interface Props {
    submitSchedule(schedule: Schedule): void;
    amount: bigint;
}

/**
 * Component to build a "regular interval" schedule.
 */
export default function RegularInterval({ submitSchedule, amount }: Props) {
    const [releases, setReleases] = useState<number>(1);
    const [chosenInterval, setChosenInterval] = useState<Interval>(
        intervals[0]
    );
    const [startTime, setStartTime] = useState<number>(
        getNow() + 5 * TimeConstants.Minute
    ); // TODO Decide appropiate default

    function createSchedule() {
        const schedule = createRegularIntervalSchedule(
            amount,
            releases,
            startTime,
            chosenInterval.value
        );
        submitSchedule(schedule);
    }

    return (
        <>
            <List.Item>
                Release Every:
                <Button.Group>
                    {intervals.map((interval: Interval) => (
                        <Button
                            key={interval.label}
                            onClick={() => setChosenInterval(interval)}
                        >
                            {interval.label}
                        </Button>
                    ))}
                </Button.Group>
            </List.Item>
            <List.Item>
                <Label>Enter amount of releases</Label>
                <Input
                    fluid
                    name="name"
                    placeholder="Enter Amount"
                    value={releases}
                    onChange={(e) => setReleases(parseInt(e.target.value, 10))}
                    autoFocus
                    type="number"
                />
            </List.Item>
            <List.Item>
                <Label>Enter starting time:</Label>
                <InputTimeStamp
                    placeholder="Enter Starting time"
                    value={startTime}
                    setValue={setStartTime}
                />
            </List.Item>
            <List.Item>
                <Button onClick={createSchedule}>submit</Button>
            </List.Item>
        </>
    );
}
