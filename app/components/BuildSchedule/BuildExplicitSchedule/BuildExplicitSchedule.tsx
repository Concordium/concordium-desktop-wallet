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
    displayAsGTU,
    getGTUSymbol,
    isValidGTUString,
    toMicroUnits,
} from '~/utils/gtu';
import { getNow, TimeConstants } from '~/utils/timeHelpers';
import Form from '../../Form';
import { futureDate } from '../../Form/util/validation';
import ScheduleList from '../../ScheduleList';
import Button from '~/cross-app-components/Button';
import Card from '~/cross-app-components/Card';

import styles from './BuildExplicitSchedule.module.scss';
import {
    ScheduledTransferBuilderBaseProps,
    ScheduledTransferBuilderRef,
} from '../util';
import { noOp } from '~/utils/basicHelpers';
import Label from '~/components/Label';

export interface Defaults {
    schedule: Schedule;
}

interface Props extends ScheduledTransferBuilderBaseProps {
    submitSchedule(schedule: Schedule, recoverState: Defaults): void;
    amount: bigint;
    defaults?: Defaults;
    setScheduleLength: (scheduleLength: number) => void;
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
// export default function BuildExplicitSchedule({
const BuildExplicitSchedule = forwardRef<ScheduledTransferBuilderRef, Props>(
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
        const [schedule, setSchedule] = useState<Schedule>(
            defaults?.schedule || []
        );
        const [usedAmount, setUsedAmount] = useState<bigint>(
            schedule.reduce((acc, point) => acc + BigInt(point.amount), 0n)
        );
        const [adding, setAdding] = useState<boolean>(false);
        const methods = useForm<AddSchedulePointForm>({ mode: 'onTouched' });
        const { reset } = methods;

        const canSubmit = usedAmount === amount;
        // eslint-disable-next-line react-hooks/exhaustive-deps
        useEffect(() => onValidChange(canSubmit), [canSubmit]);

        const submit = useCallback(
            () => submitSchedule(schedule, { schedule }),
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
            if (pointAmount && isValidGTUString(pointAmount)) {
                const value = toMicroUnits(pointAmount);
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
                    {getGTUSymbol()}{' '}
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
                            <span>Add release to schedule</span>
                            <HeaderIcon />
                        </Button>
                        {adding ? addSchedulePointForm : null}
                    </Card>
                    {!adding ? (
                        <ScheduleList
                            schedule={schedule}
                            removeFromSchedule={removeFromSchedule}
                        />
                    ) : null}
                </div>
                {!hideSubmitButton && (
                    <Button
                        size="big"
                        className={styles.submitButton}
                        disabled={!canSubmit}
                        onClick={submit}
                    >
                        Continue
                    </Button>
                )}
            </>
        );
    }
);

export default BuildExplicitSchedule;
