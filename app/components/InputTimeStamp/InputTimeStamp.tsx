/* eslint-disable radix */
import clsx from 'clsx';
import React, { InputHTMLAttributes, useEffect, useReducer } from 'react';
import {
    Control,
    RegisterOptions,
    useController,
    useForm,
} from 'react-hook-form';
import { EqualRecord, NotOptional } from '../../utils/types';

import styles from './InputTimeStamp.module.scss';
import {
    DateParts,
    reducer,
    updateDate,
    updateParts,
} from './inputTimeStampReducer';

export interface InputTimeStampProps {
    label?: string | JSX.Element;
    value?: Date;
    onChange(date?: Date): void;
}

const ensureNumberLength = (length: number) => (value?: number): string => {
    if (Number.isNaN(value) || value === undefined) {
        return '';
    }

    const valueLength = `${value}`.length;

    if (valueLength >= length) {
        return `${value}`;
    }

    const missing = length - valueLength;
    const prepend = new Array(missing).fill(`0`).join('');

    return `${prepend}${value}`;
};

const ensureFour = ensureNumberLength(4);
const ensureTwo = ensureNumberLength(2);

type InputProps = NotOptional<
    Pick<
        InputHTMLAttributes<HTMLInputElement>,
        'name' | 'className' | 'placeholder'
    >
>;

interface TimeStampFieldProps extends InputProps {
    rules?: RegisterOptions;
    control: Control;
    formatValue(v?: number): string;
}

function TimeStampField({
    name,
    className,
    placeholder,
    rules,
    control,
    formatValue,
}: TimeStampFieldProps): JSX.Element {
    const {
        field: { ref, value, onChange, ...inputProps },
    } = useController({ name, rules, control, defaultValue: NaN });

    console.log(name, value);

    return (
        <input
            className={className}
            type="string"
            placeholder={placeholder}
            value={formatValue(value)}
            onChange={(e) => onChange(parseInt(e.target.value))}
            {...inputProps}
        />
    );
}

const fieldNames: EqualRecord<DateParts> = {
    year: 'year',
    month: 'month',
    date: 'date',
    hours: 'hours',
    minutes: 'minutes',
    seconds: 'seconds',
};

export default function InputTimeStamp({
    label,
    value,
    onChange,
}: InputTimeStampProps): JSX.Element {
    const [{ formattedDate, isInvalid, ...dateParts }, dispatch] = useReducer(
        reducer,
        {}
    );

    const { control, watch, errors, setValue } = useForm<DateParts>();
    const fields = watch();

    console.log(fields);

    useEffect(() => {
        dispatch(updateDate(value));
    }, [value]);

    useEffect(() => {
        dispatch(updateParts(fields, errors));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(fields), errors]);

    useEffect(() => {
        (Object.keys(dateParts) as Array<keyof DateParts>).forEach((k) =>
            setValue(k, dateParts[k])
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(dateParts), setValue]);

    useEffect(() => {
        onChange(formattedDate);
    }, [formattedDate, onChange]);

    return (
        <div className={styles.root}>
            {label}
            <br />
            errors: {JSON.stringify(errors)}
            <div
                className={clsx(styles.input, isInvalid && styles.inputInvalid)}
            >
                <TimeStampField
                    className={styles.year}
                    name={fieldNames.year}
                    placeholder="YYYY"
                    control={control}
                    formatValue={ensureFour}
                    rules={{ maxLength: 4 }}
                />
                -
                <TimeStampField
                    className={styles.field}
                    name={fieldNames.month}
                    placeholder="MM"
                    control={control}
                    formatValue={ensureTwo}
                />
                -
                <TimeStampField
                    className={styles.field}
                    name={fieldNames.date}
                    placeholder="DD"
                    control={control}
                    formatValue={ensureTwo}
                />
                <span>at</span>
                <TimeStampField
                    className={styles.field}
                    name={fieldNames.hours}
                    placeholder="HH"
                    control={control}
                    formatValue={ensureTwo}
                />
                :
                <TimeStampField
                    className={styles.field}
                    name={fieldNames.minutes}
                    placeholder="MM"
                    control={control}
                    formatValue={ensureTwo}
                />
                :
                <TimeStampField
                    className={styles.field}
                    name={fieldNames.seconds}
                    placeholder="SS"
                    control={control}
                    formatValue={ensureTwo}
                />
            </div>
        </div>
    );
}
