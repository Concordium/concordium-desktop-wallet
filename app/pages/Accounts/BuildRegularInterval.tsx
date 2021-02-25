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

export interface Defaults {
    releases: number;
    chosenInterval: Interval;
    startTime: number;
}

interface Props {
    defaults: Defaults;
    submitSchedule(schedule: Schedule, recoverState: Defaults): void;
    amount: bigint;
}

/**
 * Component to build a "regular interval" schedule.
 */
export default function RegularInterval({
    submitSchedule,
    amount,
    defaults,
}: Props) {
    const [releases, setReleases] = useState<number>(defaults?.releases || 1);
    const [chosenInterval, setChosenInterval] = useState<Interval>(
        defaults?.chosenInterval || intervals[0]
    );
    const [startTime, setStartTime] = useState<number>(
        defaults?.startTime || getNow() + 5 * TimeConstants.Minute
    ); // TODO Decide appropiate default

    function createSchedule() {
        const schedule = createRegularIntervalSchedule(
            amount,
            releases,
            startTime,
            chosenInterval.value
        );
        const recoverState = {
            releases,
            startTime,
            chosenInterval,
        };
        submitSchedule(schedule, recoverState);
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
