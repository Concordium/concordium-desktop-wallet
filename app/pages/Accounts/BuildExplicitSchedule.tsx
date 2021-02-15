import React, { useState } from 'react';
import {
    Header,
    Label,
    List,
    Button,
    Input,
    Card,
    Form,
} from 'semantic-ui-react';
import { Schedule, TimeStampUnit } from '../../utils/types';
import { displayAsGTU, isValidGTUString, toMicroUnits } from '../../utils/gtu';
import { parseTime } from '../../utils/timeHelpers';
import InputTimeStamp from '../../components/InputTimeStamp';

interface Props {
    submitSchedule(schedule: Schedule): void;
    amount: bigint;
}

const getNow = () => new Date().getTime();

export default function ExplicitSchedule({ submitSchedule, amount }: Props) {
    const [schedule, setSchedule] = useState<Schedule>([]);
    const [pointAmount, setAmount] = useState<string>('');
    const [usedAmount, setUsedAmount] = useState<bigint>(0n);

    const [adding, setAdding] = useState<boolean>(false);

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
        setUsedAmount(usedAmount - BigInt(schedule[index].amount));
        setSchedule(schedule.slice(0, index).concat(schedule.slice(index + 1)));
    }

    function validateCurrentAmount(): boolean {
        if (pointAmount && isValidGTUString(pointAmount)) {
            const value = toMicroUnits(pointAmount);
            return value > 0n && value + usedAmount <= amount;
        }
        return false;
    }

    const addSchedulePointForm = (
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
            <InputTimeStamp
                placeholder="Enter Release time"
                value={pointTimestamp}
                setValue={setTimestamp}
            />
            <Button disabled={!validateCurrentAmount()} type="submit">
                Add
            </Button>
        </Form>
    );

    return (
        <>
            <List.Item>Releases:</List.Item>
            <List.Item>
                ({displayAsGTU(usedAmount)} of {displayAsGTU(amount)} in
                schedule)
            </List.Item>
            <List.Item>
                <Card>
                    <Header>
                        Add release to schedule
                        <Button
                            compact
                            content={adding ? 'x' : '+'}
                            onClick={() => setAdding(!adding)}
                        />
                    </Header>
                    {adding ? addSchedulePointForm : null}
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
