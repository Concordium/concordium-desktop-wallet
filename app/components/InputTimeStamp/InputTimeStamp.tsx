import clsx from 'clsx';
import React from 'react';
import { FormProvider } from 'react-hook-form';

import { useInputTimeStamp, fieldNames } from './util';
import TimeStampField from './TimeStampField';

import styles from './InputTimeStamp.module.scss';

export interface InputTimeStampProps {
    /**
     * Label to be shown with input.
     */
    label?: string | JSX.Element;
    /**
     * Value of Input (type Date).
     */
    value: Date | undefined;
    /**
     * Change event handler, supplies date as argument.
     */
    onChange(date: Date | undefined): void;
}

/**
 * @description
 * Controlled input (stores value externally) for setting date + time.
 *
 * @example
 * const [date, setDate] = useState<Date | undefined>();
 * ...
 * <InputTimeStamp label="Timestamp" value={date} onChange={setDate} />
 */
export default function InputTimeStamp({
    label,
    value,
    onChange,
}: InputTimeStampProps): JSX.Element {
    const {
        isInvalid,
        form,
        fireOnChange,
        validateDate,
        triggerDateValidation,
    } = useInputTimeStamp(onChange, value);

    return (
        <div className={styles.root}>
            {label}
            <div
                className={clsx(styles.input, isInvalid && styles.inputInvalid)}
            >
                <FormProvider {...form}>
                    <TimeStampField
                        className={styles.year}
                        name={fieldNames.year}
                        placeholder="YYYY"
                        rules={{ min: 100, max: 9999 }}
                        onFieldFormatted={fireOnChange}
                        onChange={triggerDateValidation}
                    />
                    -
                    <TimeStampField
                        className={styles.field}
                        name={fieldNames.month}
                        placeholder="MM"
                        rules={{ min: 1, max: 12 }}
                        onFieldFormatted={fireOnChange}
                        onChange={triggerDateValidation}
                    />
                    -
                    <TimeStampField
                        className={styles.field}
                        name={fieldNames.date}
                        placeholder="DD"
                        rules={{
                            validate: validateDate('Date is invalid'),
                            max: 31,
                        }}
                        onFieldFormatted={fireOnChange}
                    />
                    <span>at</span>
                    <TimeStampField
                        className={styles.field}
                        name={fieldNames.hours}
                        placeholder="HH"
                        rules={{ max: 23 }}
                        onFieldFormatted={fireOnChange}
                    />
                    :
                    <TimeStampField
                        className={styles.field}
                        name={fieldNames.minutes}
                        placeholder="MM"
                        rules={{ max: 59 }}
                        onFieldFormatted={fireOnChange}
                    />
                    :
                    <TimeStampField
                        className={styles.field}
                        name={fieldNames.seconds}
                        placeholder="SS"
                        rules={{ max: 59 }}
                        onFieldFormatted={fireOnChange}
                    />
                </FormProvider>
            </div>
            errors: {JSON.stringify(form.errors)}
        </div>
    );
}
