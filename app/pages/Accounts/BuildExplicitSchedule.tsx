import React, { useState, useEffect } from 'react';
import { Grid, Header, List, Card, Button } from 'semantic-ui-react';
import { useForm } from 'react-hook-form';
import { EqualRecord, Schedule, TimeStampUnit } from '../../utils/types';
import { displayAsGTU, isValidGTUString, toMicroUnits } from '../../utils/gtu';
import { parseTime, getNow, TimeConstants } from '../../utils/timeHelpers';
import Form from '../../components/Form';
import { futureDate } from '../../components/Form/util/validation';
import DisplayEstimatedFee from '~/components/DisplayEstimatedFee';

export interface Defaults {
    schedule: Schedule;
}

interface Props {
    submitSchedule(
        schedule: Schedule,
        estimatedFee: bigint,
        recoverState: Defaults
    ): void;
    amount: bigint;
    defaults: Defaults;
    feeCalculator: (scheduleLength: number) => bigint;
}

function getDefaultTimestamp() {
    return new Date(getNow() + 5 * TimeConstants.Minute);
}

interface AddSchedulePointForm {
    amount: string;
    timestamp: Date;
}

const addSchedulePointFormNames: EqualRecord<AddSchedulePointForm> = {
    amount: 'amount',
    timestamp: 'timestamp',
};

/**
 * Component to build a "explicit" schedule, by adding invidual releases.
 */
export default function ExplicitSchedule({
    submitSchedule,
    amount,
    defaults,
    feeCalculator,
}: Props) {
    const [schedule, setSchedule] = useState<Schedule>(
        defaults?.schedule || []
    );
    const [usedAmount, setUsedAmount] = useState<bigint>(
        schedule.reduce((acc, point) => acc + BigInt(point.amount), 0n)
    );
    const [adding, setAdding] = useState<boolean>(false);
    const methods = useForm<AddSchedulePointForm>({ mode: 'onTouched' });
    const { reset } = methods;

    const [estimatedFee, setEstimatedFee] = useState<bigint>(0n);

    function addToSchedule({
        amount: pointAmount,
        timestamp,
    }: AddSchedulePointForm) {
        const pointAmountMicro = toMicroUnits(pointAmount);
        const newPoint = {
            amount: pointAmountMicro.toString(),
            timestamp: timestamp?.getTime().toString(),
        };
        setUsedAmount(usedAmount + pointAmountMicro);
        const newSchedule = [...schedule, newPoint];
        newSchedule.sort(
            (a, b) => parseInt(a.timestamp, 10) - parseInt(b.timestamp, 10)
        );
        setSchedule(newSchedule);
        reset();
    }

    function removeFromSchedule(index: number) {
        setUsedAmount(usedAmount - BigInt(schedule[index].amount));
        setSchedule(schedule.slice(0, index).concat(schedule.slice(index + 1)));
    }

    function validateCurrentAmount(pointAmount: string): boolean {
        if (pointAmount && isValidGTUString(pointAmount)) {
            const value = toMicroUnits(pointAmount);
            return value > 0n && value + usedAmount <= amount;
        }
        return false;
    }

    useEffect(() => {
        setEstimatedFee(feeCalculator(schedule.length));
    }, [schedule.length, setEstimatedFee, feeCalculator]);

    const addSchedulePointForm = (
        <Form onSubmit={addToSchedule} formMethods={methods}>
            <Form.Input
                label="Enter amount"
                name={addSchedulePointFormNames.amount}
                placeholder="Enter Amount"
                autoFocus
                rules={{ validate: validateCurrentAmount, required: true }}
            />
            <Form.Timestamp
                name={addSchedulePointFormNames.timestamp}
                label="Enter Release time"
                rules={{
                    required: 'Timestamp required',
                    validate: futureDate('Must be future date'),
                }}
                defaultValue={getDefaultTimestamp()}
            />
            <Form.Submit>Add</Form.Submit>
        </Form>
    );

    return (
        <>
            <List.Item>Releases:</List.Item>
            <List.Item>
                ({displayAsGTU(usedAmount)} of {displayAsGTU(amount)} in
                schedule)
                <DisplayEstimatedFee estimatedFee={estimatedFee} />
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
                    onClick={() =>
                        submitSchedule(schedule, estimatedFee, { schedule })
                    }
                >
                    submit
                </Button>
            </List.Item>
        </>
    );
}
