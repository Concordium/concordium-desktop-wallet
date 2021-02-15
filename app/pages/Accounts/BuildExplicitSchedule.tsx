import React, { useState } from 'react';
import { Label, List, Button, Input, Card, Form } from 'semantic-ui-react';
import { Schedule, TimeStampUnit } from '../../utils/types';
import { displayAsGTU, isValidGTUString, toMicroUnits } from '../../utils/gtu';
import { parseTime } from '../../utils/timeHelpers';

interface Props {
    submitSchedule(schedule: Schedule): void;
    amount: bigint;
}

const getNow = () => new Date().getTime();

export default function ExplicitSchedule({ submitSchedule, amount }: Props) {
    const [schedule, setSchedule] = useState<Schedule>([]);
    const [pointAmount, setAmount] = useState<string>('');
    const [usedAmount, setUsedAmount] = useState<bigint>(0n);

    const [pointTimestamp, setTimestamp] = useState<number>(getNow()); // TODO Decide appropiate default

    function addToSchedule() {
        const newSchedule = schedule;
        const pointAmountMicro = toMicroUnits(pointAmount);
        const newPoint = {
            amount: pointAmountMicro.toString(),
            timestamp: pointTimestamp.toString(),
        };
        setUsedAmount(usedAmount + pointAmountMicro);
        newSchedule.push(newPoint);
        setSchedule(newSchedule);
        setAmount('');
        setTimestamp(getNow());
    }

    function removeFromSchedule(index: number) {
        setSchedule(schedule.slice(0, index).concat(schedule.slice(index + 1)));
    }

    return (
        <>
            <List.Item>Releases:</List.Item>
            <List.Item>
                ({displayAsGTU(usedAmount)} of {displayAsGTU(amount)} in
                schedule)
            </List.Item>
            <List.Item>
                <Card>
                    <Form onSubmit={addToSchedule}>
                        <Label>Amount:</Label>
                        <Input
                            fluid
                            name="name"
                            placeholder="Enter Amount"
                            value={pointAmount}
                            onChange={(e) => setAmount(e.target.value)}
                            autoFocus
                        />
                        <Label>Release time:</Label>
                        <Input
                            fluid
                            name="name"
                            placeholder="Enter Release time"
                            value={pointTimestamp}
                            onChange={(e) =>
                                setTimestamp(parseInt(e.target.value, 10))
                            }
                            autoFocus
                            type="number"
                        />
                        <Button
                            disabled={
                                !isValidGTUString(pointAmount) ||
                                toMicroUnits(pointAmount) + usedAmount > amount
                            }
                            type="submit"
                        >
                            {' '}
                            Add{' '}
                        </Button>
                    </Form>
                </Card>
            </List.Item>
            <List.Item>
                <List.List>
                    {schedule.map((schedulePoint, index) => (
                        <List.Item key={schedulePoint.timestamp}>
                            {index}.{' '}
                            {parseTime(
                                schedulePoint.timestamp,
                                TimeStampUnit.milliSeconds
                            )}{' '}
                            {displayAsGTU(schedulePoint.amount)}
                            <Button onClick={() => removeFromSchedule(index)}>
                                x
                            </Button>
                        </List.Item>
                    ))}
                </List.List>
            </List.Item>
            <List.Item>
                <Button onClick={() => submitSchedule(schedule)}>submit</Button>
            </List.Item>
        </>
    );
}
