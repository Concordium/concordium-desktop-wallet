import React, { useState, useEffect } from 'react';
import { Button } from 'semantic-ui-react';
import { useForm } from 'react-hook-form';
import { EqualRecord, Schedule } from '~/utils/types';
import { createRegularIntervalSchedule } from '~/utils/transactionHelpers';
import { TimeConstants } from '~/utils/timeHelpers';
import Form from '~/components/Form';
import { futureDate } from '~/components/Form/util/validation';
import DisplayEstimatedFee from '~/components/DisplayEstimatedFee';

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
    submitSchedule(
        schedule: Schedule,
        estimatedFee: bigint,
        recoverState: Defaults
    ): void;
    amount: bigint;
    feeCalculator: (scheduleLength: number) => bigint;
}

/**
 * Component to build a "regular interval" schedule.
 */
export default function RegularInterval({
    submitSchedule,
    amount,
    defaults,
    feeCalculator,
}: Props) {
    const [chosenInterval, setChosenInterval] = useState<Interval>(
        defaults?.chosenInterval || intervals[0]
    );
    const form = useForm<FormValues>({ mode: 'onTouched' });
    const releases = form.watch(fieldNames.releases);

    const [estimatedFee, setEstimatedFee] = useState<bigint>(0n);

    useEffect(() => {
        if (releases) {
            setEstimatedFee(feeCalculator(releases));
        } else {
            setEstimatedFee(0n);
        }
    }, [setEstimatedFee, feeCalculator, releases]);

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
        submitSchedule(schedule, estimatedFee, recoverState);
    }

    return (
        <>
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
            <Form formMethods={form} onSubmit={createSchedule}>
                <Form.Input
                    label="Enter amount of releases"
                    name={fieldNames.releases}
                    placeholder="Enter releases"
                    autoFocus
                    type="number"
                    defaultValue={defaults?.releases || 1}
                    rules={{ required: 'Releases required', min: 1 }}
                />
                <DisplayEstimatedFee estimatedFee={estimatedFee} />
                <Form.Timestamp
                    name={fieldNames.startTime}
                    label="Enter starting time"
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
                <Form.Submit>submit</Form.Submit>
            </Form>
        </>
    );
}
