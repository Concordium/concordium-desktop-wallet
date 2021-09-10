/* eslint-disable @typescript-eslint/no-non-null-assertion */
import clsx from 'clsx';
import React, { forwardRef, useCallback } from 'react';

import { isDefined, noOp } from '~/utils/basicHelpers';
import { CommonInputProps } from '../common';
import ErrorMessage from '../ErrorMessage';
import { fieldNames, InputTimestampRef } from './util';
import InputTimestampField from './InputTimestampField';
import useInputTimestamp from './useInputTimestamp';
import InputTimestampContext from './InputTimestampContext';
import useMultiFieldFocus from '../common/useMultiFieldFocus';
import {
    dateFromDateParts,
    DateParts,
    datePartsFromDate,
} from '~/utils/timeHelpers';
import { ClassName } from '~/utils/types';
import Label from '~/components/Label';

import styles from './InputTimestamp.module.scss';

// TODO: maybe add PAST and FUTURE as well if suitable.
enum AutoCompleteMode {
    OFF = 'off',
    ON = 'on',
}

type TimestampErrorMessages = DateParts;

const defaultErrorMessages: TimestampErrorMessages = {
    year: 'Invalid year value',
    month: 'Invalid month value',
    date: 'Invalid date value',
    hours: 'Invalid hours value',
    minutes: 'Invalid minutes value',
    seconds: 'Invalid seconds value',
};

const autoCompleteStrategies: {
    [P in AutoCompleteMode]: (parts: Partial<DateParts>) => Date | undefined;
} = {
    [AutoCompleteMode.OFF]: () => undefined,
    [AutoCompleteMode.ON]: (parts) => {
        const now = new Date();
        let baseDate: Date = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            0,
            0,
            0
        );

        if (parts.date || parts.month || parts.year) {
            baseDate = new Date(now.getFullYear(), 0, 1, 0, 0, 0);
        }

        const baseParts = datePartsFromDate(baseDate)!;

        return dateFromDateParts({
            year: parts.year || baseParts.year,
            month: parts.month || baseParts.month,
            date: parts.date || baseParts.date,
            hours: parts.hours || baseParts.hours,
            minutes: parts.minutes || baseParts.minutes,
            seconds: parts.seconds || baseParts.seconds,
        });
    },
};

export interface InputTimestampProps extends CommonInputProps, ClassName {
    /**
     * Value of Input (type Date).
     */
    value: Date | undefined;
    /**
     * Change event handler, supplies date as argument.
     */
    onChange(date: Date | undefined): void;
    /**
     * Focus event handler.
     */
    onBlur?(): void;
    /**
     * Error messages object to supply custom error messages for internal field errors.
     */
    errorMessages?: TimestampErrorMessages;
    autoComplete?: AutoCompleteMode;
}

/**
 * @description
 * Controlled input (stores value externally) for setting date + time.
 *
 * @example
 * const [date, setDate] = useState<Date | undefined>();
 * ...
 * <InputTimestamp label="Timestamp" value={date} onChange={setDate} />
 */
// eslint-disable-next-line react/display-name
const InputTimestamp = forwardRef<InputTimestampRef, InputTimestampProps>(
    (
        {
            label,
            error,
            value,
            errorMessages = defaultErrorMessages,
            isInvalid: externalInvalid = false,
            onChange,
            onBlur = noOp,
            className,
            autoComplete = AutoCompleteMode.ON,
        },
        ref
    ): JSX.Element => {
        const { form, fireOnChange, validateDate } = useInputTimestamp(
            value,
            onChange,
            ref
        );
        const formHasValue = !!Object.values(form.getValues()).find((v) => v);

        const handleBlur = useCallback(() => {
            if (!value && formHasValue) {
                const autoCompleteDate = autoCompleteStrategies[autoComplete](
                    form.getValues()
                );
                onChange(autoCompleteDate);
            }

            onBlur();
        }, [autoComplete, form, formHasValue, onBlur, onChange, value]);
        const { isFocused, setIsFocused } = useMultiFieldFocus(handleBlur);

        const internalInvalid =
            !!Object.values(form.errors).filter(isDefined)[0] && formHasValue;
        const invalid = internalInvalid || externalInvalid;

        const firstFormError =
            form.errors?.year ??
            form.errors?.month ??
            form.errors?.date ??
            form.errors?.hours ??
            form.errors?.minutes ??
            form.errors?.seconds;
        const errorMessage =
            errorMessages[firstFormError?.ref?.name as keyof DateParts] ||
            error;

        return (
            <div className={clsx(styles.root, className)}>
                <Label className="mB5">{label}</Label>
                <div
                    className={clsx(
                        styles.input,
                        isFocused && styles.inputFocused,
                        invalid && styles.inputInvalid
                    )}
                >
                    <InputTimestampContext.Provider
                        value={{ ...form, setIsFocused, fireOnChange }}
                    >
                        <InputTimestampField
                            className={styles.year}
                            name={fieldNames.year}
                            placeholder="YYYY"
                            autoNext={4}
                            rules={{ min: 100, max: 9999 }}
                        />
                        -
                        <InputTimestampField
                            className={styles.field}
                            name={fieldNames.month}
                            placeholder="MM"
                            autoNext={2}
                            rules={{ min: 1, max: 12 }}
                        />
                        -
                        <InputTimestampField
                            className={styles.field}
                            name={fieldNames.date}
                            placeholder="DD"
                            autoNext={2}
                            rules={{
                                validate: validateDate,
                                max: 31,
                            }}
                        />
                        at
                        <InputTimestampField
                            className={styles.field}
                            name={fieldNames.hours}
                            placeholder="HH"
                            autoNext={2}
                            rules={{ max: 23 }}
                        />
                        :
                        <InputTimestampField
                            className={styles.field}
                            name={fieldNames.minutes}
                            placeholder="MM"
                            autoNext={2}
                            rules={{ max: 59 }}
                        />
                        :
                        <InputTimestampField
                            className={styles.field}
                            name={fieldNames.seconds}
                            placeholder="SS"
                            rules={{ max: 59 }}
                        />
                    </InputTimestampContext.Provider>
                </div>
                <ErrorMessage>{invalid && errorMessage}</ErrorMessage>
            </div>
        );
    }
);

export default InputTimestamp;
