import React, {
    useState,
    useEffect,
    forwardRef,
    useImperativeHandle,
} from 'react';
import { useForm } from 'react-hook-form';
import { EqualRecord, Schedule } from '~/utils/types';
import {
    createRegularIntervalSchedule,
    createRegularIntervalSchedulePerMonth,
} from '~/utils/transactionHelpers';
import {
    TimeConstants,
    getDefaultScheduledStartTime,
} from '~/utils/timeHelpers';
import { isValidBigInt } from '~/utils/numberStringHelpers';
import Form from '../../Form';
import { futureDate } from '../../Form/util/validation';
import ButtonGroup from '../../ButtonGroup';
import {
    ScheduledTransferBuilderBaseProps,
    ScheduledTransferBuilderRef,
    RegularIntervalDefaults,
} from '../util';
import Label from '~/components/Label';
import ErrorMessage from '~/components/Form/ErrorMessage';

import styles from './BuildRegularInterval.module.scss';

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

interface Props extends ScheduledTransferBuilderBaseProps {
    defaults?: RegularIntervalDefaults;
    submitSchedule(
        schedule: Schedule,
        recoverState: RegularIntervalDefaults
    ): void;
    amount: bigint;
    setScheduleLength: (scheduleLength: number) => void;
}

/**
 * Component to build a "regular interval" schedule.
 */
const RegularInterval = forwardRef<ScheduledTransferBuilderRef, Props>(
    (
        {
            submitSchedule,
            amount,
            defaults,
            setScheduleLength,
            submitButtonSize,
        },
        ref
    ) => {
        const [chosenInterval, setChosenInterval] = useState<Interval>(
            intervals[defaults?.chosenInterval ?? intervals.length - 1]
        );
        const form = useForm<FormValues>({ mode: 'onTouched' });
        const releases = form.watch(fieldNames.releases);
        const { handleSubmit, errors } = form;

        function createSchedule({ startTime }: FormValues) {
            let schedule;
            if (chosenInterval.label === 'Month') {
                schedule = createRegularIntervalSchedulePerMonth(
                    amount,
                    releases,
                    startTime
                );
            } else {
                schedule = createRegularIntervalSchedule(
                    amount,
                    releases,
                    startTime.getTime(),
                    chosenInterval.value
                );
            }
            const recoverState = {
                releases,
                startTime: startTime.getTime(),
                chosenInterval: intervals.findIndex(
                    (interval) => interval.value === chosenInterval.value
                ),
                explicit: false,
            };
            submitSchedule(schedule, recoverState);
        }
        const formSubmit = handleSubmit(createSchedule);
        const canSubmit = true;

        useImperativeHandle(
            ref,
            () => ({
                submitSchedule: formSubmit,
            }),
            [formSubmit]
        );

        useEffect(() => {
            if (isValidBigInt(releases) && releases <= 255 && releases >= 0) {
                setScheduleLength(releases);
            } else {
                setScheduleLength(0);
            }
        }, [setScheduleLength, releases]);

        return (
            <>
                <ButtonGroup
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
                    <div>
                        <Label>Split transfer in:</Label>
                        <span className={styles.releasesInputWrapper}>
                            <Form.InlineNumber
                                name={fieldNames.releases}
                                defaultValue={
                                    defaults?.releases?.toString() ?? '1'
                                }
                                className={styles.releasesInput}
                                fallbackValue={1}
                                trimLeadingZeros
                                rules={{
                                    required: 'Releases required',
                                    min: {
                                        value: 1,
                                        message: 'Minimum value is 1',
                                    },
                                    max: {
                                        value: 255,
                                        message: 'Maximum value is 255',
                                    },
                                    validate: {
                                        number: (numberOfReleases: string) =>
                                            isValidBigInt(numberOfReleases) ||
                                            'Releases must be an integer between 1 and 255',
                                        splitable: (numberOfReleases: bigint) =>
                                            numberOfReleases <= amount ||
                                            'Amount cannot be split among releases',
                                    },
                                }}
                            />{' '}
                            releases
                        </span>
                        <ErrorMessage>
                            {errors[fieldNames.releases]?.message}
                        </ErrorMessage>
                    </div>
                    <Form.DatePicker
                        name={fieldNames.startTime}
                        label="Starting:"
                        defaultValue={
                            new Date(
                                defaults?.startTime ||
                                    getDefaultScheduledStartTime()
                            )
                        }
                        rules={{
                            required: true,
                            validate: futureDate('Time must be in the future'),
                        }}
                        minDate={new Date()}
                    />
                    <Form.Submit
                        className={styles.submitButton}
                        size={submitButtonSize}
                        disabled={!canSubmit}
                    >
                        Continue
                    </Form.Submit>
                </Form>
            </>
        );
    }
);

export default RegularInterval;
