import React, {
    useState,
    useEffect,
    forwardRef,
    useImperativeHandle,
    useCallback,
} from 'react';
import { useForm, Validate } from 'react-hook-form';
import PlusIcon from '@resources/svg/plus.svg';
import CloseIcon from '@resources/svg/cross.svg';
import { EqualRecord, Schedule } from '~/utils/types';
import {
    displayAsCcd,
    getCcdSymbol,
    isValidCcdString,
    ccdToMicroCcd,
} from '~/utils/ccd';
import { getDefaultScheduledStartTime } from '~/utils/timeHelpers';
import { toReleaseSchedule } from '~/utils/transactionHelpers';
import Form from '../../Form';
import { futureDate } from '../../Form/util/validation';
import ScheduleList from '../../ScheduleList';
import Button from '~/cross-app-components/Button';
import Card from '~/cross-app-components/Card';
import {
    ScheduledTransferBuilderBaseProps,
    ScheduledTransferBuilderRef,
    ExplicitScheduleDefaults,
} from '../util';
import Label from '~/components/Label';

import styles from './BuildExplicitSchedule.module.scss';

const maxScheduleAmount = 255;

interface Props extends ScheduledTransferBuilderBaseProps {
    submitSchedule(
        schedule: Schedule,
        recoverState: ExplicitScheduleDefaults
    ): void;
    amount: bigint;
    defaults?: ExplicitScheduleDefaults;
    setScheduleLength: (scheduleLength: number) => void;
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
const BuildExplicitSchedule = forwardRef<ScheduledTransferBuilderRef, Props>(
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
        const [schedule, setSchedule] = useState<Schedule>(
            defaults?.schedule || []
        );
        const [usedAmount, setUsedAmount] = useState<bigint>(
            schedule.reduce((acc, point) => acc + BigInt(point.amount), 0n)
        );
        const [adding, setAdding] = useState<boolean>(false);
        const methods = useForm<AddSchedulePointForm>({ mode: 'onTouched' });
        const { reset } = methods;

        const canSubmit =
            usedAmount === amount && schedule.length <= maxScheduleAmount;

        const submit = useCallback(
            () => submitSchedule(schedule, { schedule, explicit: true }),
            [schedule, submitSchedule]
        );

        useImperativeHandle(
            ref,
            () => ({
                submitSchedule: submit,
            }),
            [submit]
        );

        function addToSchedule({
            amount: pointAmount,
            timestamp,
        }: AddSchedulePointForm) {
            const pointAmountMicro = ccdToMicroCcd(pointAmount);
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
            setAdding(false);
            reset();
        }

        function removeFromSchedule(index: number) {
            setUsedAmount(usedAmount - BigInt(schedule[index].amount));
            setSchedule(
                schedule.slice(0, index).concat(schedule.slice(index + 1))
            );
        }

        const validateCurrentAmount: Validate = (pointAmount: string) => {
            let isValid = false;
            if (pointAmount && isValidCcdString(pointAmount)) {
                const value = ccdToMicroCcd(pointAmount);

                if (value === 0n) {
                    return 'Amount may not be zero';
                }

                isValid = value + usedAmount <= amount;
            }
            return isValid || 'Value exceeds transaction amount';
        };

        useEffect(() => {
            setScheduleLength(schedule.length);
        }, [schedule.length, setScheduleLength]);

        const addSchedulePointForm = (
            <Form onSubmit={addToSchedule} formMethods={methods}>
                <div className={styles.amountInputWrapper}>
                    <Label>Amount:</Label>
                    {getCcdSymbol()}
                    <Form.InlineNumber
                        name={addSchedulePointFormNames.amount}
                        defaultValue="0.00"
                        allowFractions
                        ensureDigits={2}
                        autoFocus
                        rules={{
                            min: {
                                value: 0,
                                message: 'Value can not be negative',
                            },
                            validate: validateCurrentAmount,
                            required: true,
                        }}
                    />
                </div>
                <Form.DatePicker
                    className="body2"
                    name={addSchedulePointFormNames.timestamp}
                    label="Release time:"
                    rules={{
                        required: 'Date and time required',
                        validate: futureDate('Must be in the future'),
                    }}
                    defaultValue={getDefaultScheduledStartTime()}
                    minDate={new Date()}
                />
                <Form.Submit size="small">Add</Form.Submit>
            </Form>
        );

        const HeaderIcon = adding ? CloseIcon : PlusIcon;

        return (
            <>
                <div className={styles.explicitSchedule}>
                    <p className={styles.releases}>Releases:</p>
                    <p className={styles.amountUsed}>
                        ({displayAsCcd(usedAmount)} of {displayAsCcd(amount)} in
                        schedule)
                    </p>
                    <Card className={styles.addScheduleCard}>
                        <Button
                            clear
                            className={styles.addScheduleCardHeader}
                            onClick={() => setAdding(!adding)}
                        >
                            <span>Add release to schedule</span>
                            <HeaderIcon />
                        </Button>
                        {adding ? addSchedulePointForm : null}
                    </Card>
                    {!adding ? (
                        <ScheduleList
                            schedule={schedule.map(toReleaseSchedule)}
                            removeFromSchedule={removeFromSchedule}
                        />
                    ) : null}
                </div>
                <Button
                    className={styles.submitButton}
                    disabled={!canSubmit}
                    size={submitButtonSize}
                    onClick={submit}
                >
                    Continue
                </Button>
            </>
        );
    }
);

export default BuildExplicitSchedule;
