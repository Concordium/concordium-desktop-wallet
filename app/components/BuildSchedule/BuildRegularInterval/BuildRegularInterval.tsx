import React, {
    useState,
    useEffect,
    forwardRef,
    useImperativeHandle,
} from 'react';
import { useForm } from 'react-hook-form';
import { EqualRecord, Schedule } from '~/utils/types';
import { createRegularIntervalSchedule } from '~/utils/transactionHelpers';
import { TimeConstants } from '~/utils/timeHelpers';
import Form from '../../Form';
import { futureDate } from '../../Form/util/validation';
import ButtonGroup from '../../ButtonGroup';
import styles from './BuildRegularInterval.module.scss';
import {
    ScheduledTransferBuilderBaseProps,
    ScheduledTransferBuilderRef,
} from '../util';
import { noOp } from '~/utils/basicHelpers';

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

interface Props extends ScheduledTransferBuilderBaseProps {
    defaults?: Defaults;
    submitSchedule(schedule: Schedule, recoverState: Defaults): void;
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
            hideSubmitButton = false,
            onValidChange = noOp,
        },
        ref
    ) => {
        const [chosenInterval, setChosenInterval] = useState<Interval>(
            defaults?.chosenInterval || intervals[0]
        );
        const form = useForm<FormValues>({ mode: 'onTouched' });
        const releases = form.watch(fieldNames.releases);
        const { handleSubmit } = form;

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
        const formSubmit = handleSubmit(createSchedule);
        const canSubmit = true;

        // eslint-disable-next-line react-hooks/exhaustive-deps
        useEffect(() => onValidChange(canSubmit), [canSubmit]);

        useImperativeHandle(
            ref,
            () => ({
                submitSchedule: formSubmit,
            }),
            [formSubmit]
        );

        useEffect(() => {
            setScheduleLength(releases);
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
                    {!hideSubmitButton && (
                        <Form.Submit
                            className={styles.submitButton}
                            size="big"
                            disabled={!canSubmit}
                        >
                            Continue
                        </Form.Submit>
                    )}
                </Form>
            </>
        );
    }
);

export default RegularInterval;
