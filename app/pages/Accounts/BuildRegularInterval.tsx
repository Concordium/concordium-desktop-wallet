import React, { useState } from 'react';
import { Label, List, Button, Input } from 'semantic-ui-react';
import { Schedule } from '../../utils/types';
import { createRegularIntervalSchedule } from '../../utils/transactionHelpers';
import InputTimeStamp from '../../components/InputTimeStamp';

const second = 1000;

interface Interval {
    label: string;
    value: number;
}
const intervals: Interval[] = [
    { label: 'Second', value: 1 * second },
    { label: 'Minute', value: 60 * second },
    { label: 'Hour', value: 60 * 60 * second },
    { label: 'Day', value: 24 * 60 * 60 * second },
    { label: 'Week', value: 7 * 24 * 60 * 60 * second },
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
        new Date().getTime() + 5 * 60 * second
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
