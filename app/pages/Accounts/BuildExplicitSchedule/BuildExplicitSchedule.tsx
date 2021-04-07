import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import BinIcon from '@resources/svg/bin.svg';
import PlusIcon from '@resources/svg/plus.svg';
import CloseIcon from '@resources/svg/cross.svg';
import { EqualRecord, Schedule, TimeStampUnit } from '~/utils/types';
import { displayAsGTU, isValidGTUString, toMicroUnits } from '~/utils/gtu';
import { parseTime, getNow, TimeConstants } from '~/utils/timeHelpers';
import Form from '~/components/Form';
import { futureDate } from '~/components/Form/util/validation';
import Button from '~/cross-app-components/Button';
import Card from '~/cross-app-components/Card';
import styles from './BuildExplicitSchedule.module.scss';

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
export default function BuildExplicitSchedule({
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
            <Form.Submit size="small">Add</Form.Submit>
        </Form>
    );

    const showSchedules = (
        <div className={styles.scheduleList}>
            {schedule.map((schedulePoint, index) => (
                <div
                    key={schedulePoint.timestamp + schedulePoint.amount}
                    className={styles.scheduleListRow}
                >
                    <div>
                        {index + 1}.{' '}
                        {parseTime(
                            schedulePoint.timestamp,
                            TimeStampUnit.milliSeconds
                        )}
                    </div>
                    <div>
                        {displayAsGTU(schedulePoint.amount)}{' '}
                        <Button clear onClick={() => removeFromSchedule(index)}>
                            <BinIcon className={styles.binIcon} />
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    );

    const HeaderIcon = adding ? CloseIcon : PlusIcon;

    return (
        <>
            <div className={styles.explicitSchedule}>
                <p className={styles.releases}>Releases:</p>
                <p className={styles.amountUsed}>
                    ({displayAsGTU(usedAmount)} of {displayAsGTU(amount)} in
                    schedule)
                </p>
                <Card className={styles.addScheduleCard}>
                    <Button
                        clear
                        className={styles.addScheduleCardHeader}
                        onClick={() => setAdding(!adding)}
                    >
                        <p>Add release to schedule</p>
                        <HeaderIcon />
                    </Button>
                    {adding ? addSchedulePointForm : null}
                </Card>
                {!adding ? showSchedules : null}
            </div>
            <Button
                size="big"
                className={styles.submitButton}
                disabled={usedAmount < amount}
                onClick={() => submitSchedule(schedule, { schedule })}
            >
                Continue
            </Button>
        </>
    );
}
