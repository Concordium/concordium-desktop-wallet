/* eslint-disable radix */
import clsx from 'clsx';
import React from 'react';

import { FormProvider } from 'react-hook-form';
import { useInputTimeStamp, fieldNames } from './util';
import TimeStampField from './TimeStampField';

import styles from './InputTimeStamp.module.scss';

export interface InputTimeStampProps {
    label?: string | JSX.Element;
    value?: Date;
    onChange(date?: Date): void;
}

export default function InputTimeStamp({
    label,
    value,
    onChange,
}: InputTimeStampProps): JSX.Element {
    // const validateDate: Validate = useCallback(() => {
    //     if (Object.keys(errors).length > 0 || !isInvalid) {
    //         return undefined;
    //     }

    //     return 'Date is invalid';
    // }, [errors, isInvalid]);
    const { isInvalid, form } = useInputTimeStamp(onChange, value);

    return (
        <div className={styles.root}>
            {label}
            <br />
            errors: {JSON.stringify(form.errors)}
            <div
                className={clsx(styles.input, isInvalid && styles.inputInvalid)}
            >
                <FormProvider {...form}>
                    <TimeStampField
                        className={styles.year}
                        name={fieldNames.year}
                        placeholder="YYYY"
                        rules={{ min: 100, max: 9999 }}
                    />
                    -
                    <TimeStampField
                        className={styles.field}
                        name={fieldNames.month}
                        placeholder="MM"
                        rules={{ min: 1, max: 12 }}
                    />
                    -
                    <TimeStampField
                        className={styles.field}
                        name={fieldNames.date}
                        placeholder="DD"
                        // rules={{ validate: validateDate }}
                    />
                    <span>at</span>
                    <TimeStampField
                        className={styles.field}
                        name={fieldNames.hours}
                        placeholder="HH"
                        rules={{ max: 23 }}
                    />
                    :
                    <TimeStampField
                        className={styles.field}
                        name={fieldNames.minutes}
                        placeholder="MM"
                        rules={{ max: 59 }}
                    />
                    :
                    <TimeStampField
                        className={styles.field}
                        name={fieldNames.seconds}
                        placeholder="SS"
                        rules={{ max: 59 }}
                    />
                </FormProvider>
            </div>
        </div>
    );
}
