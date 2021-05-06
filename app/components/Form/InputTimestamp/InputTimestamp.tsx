import clsx from 'clsx';
import React from 'react';

import { isDefined } from '../../../utils/basicHelpers';
import { CommonInputProps } from '../common';
import ErrorMessage from '../ErrorMessage';
import { fieldNames } from './util';
import InputTimestampField from './InputTimestampField';
import useInputTimestamp from './useInputTimestamp';
import InputTimestampContext from './InputTimestampContext';

import styles from './InputTimestamp.module.scss';
import useMultiFieldFocus from '../common/useMultiFieldFocus';
import { DateParts } from '~/utils/timeHelpers';
import { ClassName } from '~/utils/types';
import Label from '~/components/Label';

type TimestampErrorMessages = DateParts;

const defaultErrorMessages: TimestampErrorMessages = {
    year: 'Invalid year value',
    month: 'Invalid month value',
    date: 'Invalid date value',
    hours: 'Invalid hours value',
    minutes: 'Invalid minutes value',
    seconds: 'Invalid seconds value',
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
export default function InputTimestamp({
    label,
    error,
    value,
    errorMessages = defaultErrorMessages,
    isInvalid = false,
    onChange,
    onBlur,
    className,
}: InputTimestampProps): JSX.Element {
    const { form, fireOnChange, validateDate } = useInputTimestamp(
        value,
        onChange
    );
    const { isFocused, setIsFocused } = useMultiFieldFocus(onBlur);

    const firstFormError = Object.values(form.errors).filter(isDefined)[0];
    const errorMessage =
        errorMessages[firstFormError?.ref?.name as keyof DateParts] || error;
    const invalid =
        !!Object.values(form.errors).filter(isDefined)[0] || isInvalid;

    return (
        <div className={clsx(styles.root, className)}>
            <Label>{label}</Label>
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
                        rules={{ min: 100, max: 9999 }}
                    />
                    -
                    <InputTimestampField
                        className={styles.field}
                        name={fieldNames.month}
                        placeholder="MM"
                        rules={{ min: 1, max: 12 }}
                    />
                    -
                    <InputTimestampField
                        className={styles.field}
                        name={fieldNames.date}
                        placeholder="DD"
                        rules={{
                            validate: validateDate,
                            max: 31,
                        }}
                    />
                    <span>at</span>
                    <InputTimestampField
                        className={styles.field}
                        name={fieldNames.hours}
                        placeholder="HH"
                        rules={{ max: 23 }}
                    />
                    :
                    <InputTimestampField
                        className={styles.field}
                        name={fieldNames.minutes}
                        placeholder="MM"
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
            <ErrorMessage>{errorMessage}</ErrorMessage>
        </div>
    );
}
