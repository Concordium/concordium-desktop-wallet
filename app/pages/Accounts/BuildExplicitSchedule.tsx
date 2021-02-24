import React, { useState } from 'react';
import {
    Grid,
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
import { parseTime, getNow, TimeConstants } from '../../utils/timeHelpers';
import InputTimeStamp from '../../components/InputTimeStamp';

interface Props {
    submitSchedule(schedule: Schedule): void;
    amount: bigint;
}

function getDefaultTimestamp() {
    return getNow() + 5 * TimeConstants.Minute;
}

/**
 * Component to build a "explicit" schedule, by adding invidual releases.
 */
export default function ExplicitSchedule({ submitSchedule, amount }: Props) {
    const [schedule, setSchedule] = useState<Schedule>([]);
    const [pointAmount, setAmount] = useState<string>('');
    const [usedAmount, setUsedAmount] = useState<bigint>(0n);

    const [adding, setAdding] = useState<boolean>(false);

    const [pointTimestamp, setTimestamp] = useState<number>(
        getDefaultTimestamp()
    ); // TODO Decide appropiate default

    function addToSchedule() {
        const newSchedule = schedule;
        const pointAmountMicro = toMicroUnits(pointAmount);
        const newPoint = {
            amount: pointAmountMicro.toString(),
            timestamp: pointTimestamp.toString(),
        };
        setUsedAmount(usedAmount + pointAmountMicro);
        newSchedule.push(newPoint);
        setSchedule(
            newSchedule.sort(
                (a, b) => parseInt(a.timestamp, 10) - parseInt(b.timestamp, 10)
            )
        );
        setAmount('');
        setTimestamp(getDefaultTimestamp());
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
                <Card centered>
                    <Header>
                        Add release to schedule
                        <Button
                            floated="right"
                            compact
                            content={adding ? 'x' : '+'}
                            onClick={() => setAdding(!adding)}
                        />
                    </Header>
                    {adding ? addSchedulePointForm : null}
                </Card>
            </List.Item>
            <List.Item>
                <Grid textAlign="center" columns="4">
                    {schedule.map((schedulePoint, index) => (
                        <Grid.Row key={schedulePoint.timestamp}>
                            <Grid.Column>{index + 1}.</Grid.Column>
                            <Grid.Column>
                                {parseTime(
                                    schedulePoint.timestamp,
                                    TimeStampUnit.milliSeconds
                                )}{' '}
                            </Grid.Column>
                            <Grid.Column>
                                {displayAsGTU(schedulePoint.amount)}
                            </Grid.Column>
                            <Grid.Column>
                                <Button
                                    onClick={() => removeFromSchedule(index)}
                                >
                                    x
                                </Button>
                            </Grid.Column>
                        </Grid.Row>
                    ))}
                </Grid>
            </List.Item>
            <List.Item>
                <Button
                    disabled={usedAmount < amount}
                    onClick={() => submitSchedule(schedule)}
                >
                    submit
                </Button>
            </List.Item>
        </>
    );
}
