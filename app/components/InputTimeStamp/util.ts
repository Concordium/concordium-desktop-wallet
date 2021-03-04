/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable radix */
import { useCallback, useEffect, useMemo } from 'react';

import { useForm } from 'react-hook-form';
import { EqualRecord } from '../../utils/types';

export interface DateParts {
    year: string;
    month: string;
    date: string;
    hours: string;
    minutes: string;
    seconds: string;
}

export const fieldNames: EqualRecord<DateParts> = {
    year: 'year',
    month: 'month',
    date: 'date',
    hours: 'hours',
    minutes: 'minutes',
    seconds: 'seconds',
};

function hasAllParts(parts: Partial<DateParts>): parts is DateParts {
    const values = Object.values(parts);
    return (
        values.length === Object.keys(fieldNames).length &&
        values.every((v) => !!v)
    );
}

function fromDate(date?: Date): DateParts | undefined {
    if (!date) {
        return undefined;
    }

    return {
        year: `${date.getFullYear()}`,
        month: `${date.getMonth() + 1}`,
        date: `${date.getDate()}`,
        hours: `${date.getHours()}`,
        minutes: `${date.getMinutes()}`,
        seconds: `${date.getSeconds()}`,
    };
}

function fromDateParts(date: DateParts): Date {
    return new Date(
        parseInt(date.year),
        parseInt(date.month) - 1,
        parseInt(date.date),
        parseInt(date.hours),
        parseInt(date.minutes),
        parseInt(date.seconds)
    );
}

function isEqual(a: DateParts, b: DateParts): boolean {
    return (
        parseInt(a.year) === parseInt(b.year) &&
        parseInt(a.month) === parseInt(b.month) &&
        parseInt(a.date) === parseInt(b.date) &&
        parseInt(a.hours) === parseInt(b.hours) &&
        parseInt(a.minutes) === parseInt(b.minutes) &&
        parseInt(a.seconds) === parseInt(b.seconds)
    );
}

const ensureNumberLength = (length: number) => (value?: string): string => {
    if (!value) {
        return '';
    }

    const valueLength = value.length;

    if (valueLength >= length) {
        return value;
    }

    const missing = length - valueLength;
    const prepend = new Array(missing).fill(`0`).join('');

    return `${prepend}${value}`;
};

type Formatters = { [key in keyof DateParts]: (v?: string) => string };

const formatters: Formatters = {
    year: ensureNumberLength(4),
    month: ensureNumberLength(2),
    date: ensureNumberLength(2),
    hours: ensureNumberLength(2),
    minutes: ensureNumberLength(2),
    seconds: ensureNumberLength(2),
};

export function useInputTimeStamp(onChange: (v?: Date) => void, value?: Date) {
    const f = useForm<Partial<DateParts>>({ mode: 'onTouched' });
    const { watch, setValue, errors } = f;
    const fields = watch();

    const setFormattedValue = useCallback(
        (name: keyof DateParts, v?: string) =>
            setValue(name, formatters[name](v)),
        [setValue]
    );

    const parts = useMemo(() => fromDate(value), [value?.toISOString()]);

    useEffect(() => {
        if (!parts) {
            return;
        }

        (Object.keys(parts) as Array<keyof DateParts>).forEach((k) =>
            setFormattedValue(k, parts[k])
        );
    }, [parts, setFormattedValue]);

    const fireOnChange = useCallback(() => {
        if (!hasAllParts(fields)) {
            onChange(undefined);
        } else {
            const date = fromDateParts(fields);
            const test = fromDate(date);

            const isValid = test && isEqual(fields, test);

            onChange(isValid ? date : undefined);
        }
    }, [setFormattedValue, fields]);

    const form: typeof f = { ...f, setValue: setFormattedValue };
    const isInvalid = hasAllParts(fields) && Object.keys(errors).length > 0;

    return { isInvalid, form, fireOnChange };
}
