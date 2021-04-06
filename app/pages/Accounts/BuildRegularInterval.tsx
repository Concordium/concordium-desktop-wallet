import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { EqualRecord, Schedule } from '~/utils/types';
import { createRegularIntervalSchedule } from '~/utils/transactionHelpers';
import { TimeConstants } from '~/utils/timeHelpers';
import Form from '~/components/Form';
import { futureDate } from '~/components/Form/util/validation';
import Group from './ButtonGroup';
import styles from './Accounts.module.scss';

export interface Interval {
    label: string;
    value: number;
}

export const intervals: Interval[] = [
    { label: 'Minute', value: TimeConstants.Minute },
    { label: 'Hour', value: TimeConstants.Hour },
    { label: 'Day', value: TimeConstants.Day },
    { label: 'Week', value: TimeConstants.Week },
    { label: 'Month', value: TimeConstants.Month },
];

interface FormValues {
    releases: number;
    startTime: Date;
}

const fieldNames: EqualRecord<FormValues> = {
    releases: 'releases',
    startTime: 'startTime',
};

export interface Defaults {
    releases: number;
    chosenInterval: Interval;
    startTime: number;
}

interface Props {
    defaults: Defaults;
    submitSchedule(schedule: Schedule, recoverState: Defaults): void;
    amount: bigint;
    setScheduleLength: (scheduleLength: number) => void;
}

/**
 * Component to build a "regular interval" schedule.
 */
export default function RegularInterval({
    submitSchedule,
    amount,
    defaults,
    setScheduleLength,
}: Props) {
    const [chosenInterval, setChosenInterval] = useState<Interval>(
        defaults?.chosenInterval || intervals[0]
    );
    const form = useForm<FormValues>({ mode: 'onTouched' });
    const releases = form.watch(fieldNames.releases);

    useEffect(() => {
        setScheduleLength(releases);
    }, [setScheduleLength, releases]);

    function createSchedule({ startTime }: FormValues) {
        const schedule = createRegularIntervalSchedule(
            amount,
            releases,
            startTime.getTime(),
            chosenInterval.value
        );
        const recoverState = {
            releases,
            startTime: startTime.getTime(),
            chosenInterval,
        };
        submitSchedule(schedule, recoverState);
    }

    return (
        <>
            <Group
                buttons={intervals}
                isSelected={(interval) => interval === chosenInterval}
                onClick={setChosenInterval}
                name="interval"
                title="Release Every:"
            />
            <Form
                onSubmit={createSchedule}
                formMethods={form}
                className={styles.regularInterval}
            >
                <Form.Input
                    label="Split transfer in:"
                    name={fieldNames.releases}
                    placeholder="Enter releases"
                    autoFocus
                    type="number"
                    defaultValue={defaults?.releases || 1}
                    rules={{ required: 'Releases required', min: 1 }}
                />
                <Form.Timestamp
                    name={fieldNames.startTime}
                    label="Starting:"
                    defaultValue={
                        new Date(
                            defaults?.startTime ||
                                Date.now() + 5 * TimeConstants.Minute
                        )
                    }
                    rules={{
                        required: true,
                        validate: futureDate('Time must be in the future'),
                    }}
                />
                <Form.Submit size="huge">Continue</Form.Submit>
            </Form>
        </>
    );
}
