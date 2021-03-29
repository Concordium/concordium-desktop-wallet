import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { EqualRecord, Schedule, TimeStampUnit } from '~/utils/types';
import { displayAsGTU, isValidGTUString, toMicroUnits } from '~/utils/gtu';
import { parseTime, getNow, TimeConstants } from '~/utils/timeHelpers';
import Form from '~/components/Form';
import { futureDate } from '~/components/Form/util/validation';
import Button from '~/cross-app-components/Button';
import Card from '~/cross-app-components/Card';
import styles from './Accounts.module.scss';

export interface Defaults {
    schedule: Schedule;
}

interface Props {
    submitSchedule(schedule: Schedule, recoverState: Defaults): void;
    amount: bigint;
    defaults: Defaults;
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

    function addToSchedule({
        amount: pointAmount,
        timestamp,
    }: AddSchedulePointForm) {
        const newSchedule = schedule;
        const pointAmountMicro = toMicroUnits(pointAmount);
        const newPoint = {
            amount: pointAmountMicro.toString(),
            timestamp: timestamp?.getTime().toString(),
        };
        setUsedAmount(usedAmount + pointAmountMicro);
        newSchedule.push(newPoint);
        setSchedule(
            newSchedule.sort(
                (a, b) => parseInt(a.timestamp, 10) - parseInt(b.timestamp, 10)
            )
        );
        setAdding(false);
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

    const addSchedulePointForm = (
        <Form onSubmit={addToSchedule} formMethods={methods}>
            <Form.Input
                label="Amount:"
                name={addSchedulePointFormNames.amount}
                placeholder="Enter Amount"
                autoFocus
                rules={{ validate: validateCurrentAmount, required: true }}
            />
            <Form.Timestamp
                name={addSchedulePointFormNames.timestamp}
                label="Release time:"
                rules={{
                    required: 'Timestamp required',
                    validate: futureDate('Must be future date'),
                }}
                defaultValue={getDefaultTimestamp()}
            />
            <Form.Submit>Add</Form.Submit>
        </Form>
    );

    const showSchedules = (
        <div className={styles.scheduleList}>
            {schedule.map((schedulePoint, index) => (
                <div
                    key={schedulePoint.timestamp + schedulePoint.amount}
                    className={styles.scheduleListRow}
                >
                    <div>{index + 1}.</div>
                    <div>
                        {parseTime(
                            schedulePoint.timestamp,
                            TimeStampUnit.milliSeconds
                        )}
                    </div>
                    <div>{displayAsGTU(schedulePoint.amount)}</div>
                    <div>
                        <Button clear onClick={() => removeFromSchedule(index)}>
                            x
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <>
            <div className={styles.explicitSchedule}>
                <h3>Releases:</h3>
                <h2 color="grey">
                    ({displayAsGTU(usedAmount)} of {displayAsGTU(amount)} in
                    schedule)
                </h2>
                <Card className={styles.addScheduleCard}>
                    <Button
                        clear
                        className={styles.addScheduleCardCloseButton}
                        onClick={() => setAdding(!adding)}
                    >
                        <h2>{adding ? 'x' : '+'}</h2>
                    </Button>
                    <h2>Add release to schedule</h2>
                    {adding ? addSchedulePointForm : null}
                </Card>
                {!adding ? showSchedules : null}
            </div>
            <Button
                size="huge"
                disabled={usedAmount < amount}
                onClick={() => submitSchedule(schedule, { schedule })}
            >
                Continue
            </Button>
        </>
    );
}
