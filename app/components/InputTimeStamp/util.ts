/* eslint-disable radix */
import {
    createContext,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';
import { debounce } from 'lodash';

import { useForm, UseFormMethods, Validate } from 'react-hook-form';
import { EqualRecord } from '../../utils/types';
import { useUpdateEffect } from '../../utils/hooks';

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

type PartialDateParts = Pick<DateParts, 'year' | 'month' | 'date'> &
    Partial<Omit<DateParts, 'year' | 'month' | 'date'>>;
const isValidDate = (parts: PartialDateParts): boolean => {
    const t: DateParts = {
        ...parts,
        hours: parts.hours || '0',
        minutes: parts.minutes || '0',
        seconds: parts.seconds || '0',
    };
    const date = fromDateParts(t);
    const test = fromDate(date);

    const isValid = test !== undefined && isEqual(t, test);

    return isValid;
};

/**
 * @description
 * Only to be used with \<InputTimeStamp /\> component.
 *
 * @param onChange Change event handler
 * @param value date value of controlled input component
 */
export function useInputTimeStamp(
    value: Date | undefined,
    onChange: (v?: Date) => void,
    onBlur?: () => void
) {
    const [isFocused, setIsFocused] = useState(false);
    const f = useForm<Partial<DateParts>>({ mode: 'onTouched' });
    const { watch, setValue, errors, trigger, formState } = f;
    const fields = watch();

    const setFormattedValue = useCallback(
        (name: keyof DateParts, v?: string) => {
            setValue(name, formatters[name](v));
        },
        [setValue]
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedBlur = useCallback(
        debounce((focus: boolean) => {
            if (onBlur && !focus) {
                onBlur();
            }
        }, 0),
        [onBlur]
    );

    // To work around object identity comparison of "value"
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const parts = useMemo(() => fromDate(value), [value?.toISOString()]);

    useEffect(() => {
        if (!parts) {
            return;
        }

        (Object.keys(parts) as Array<keyof DateParts>).forEach((k) =>
            setFormattedValue(k, parts[k])
        );
        // To work around object identity comparison fo "parts"
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(parts), setFormattedValue]);

    useUpdateEffect(() => debouncedBlur(isFocused), [debouncedBlur, isFocused]);

    const fireOnChange = useCallback(() => {
        if (!hasAllParts(fields)) {
            onChange(undefined);
        } else {
            const date = fromDateParts(fields);
            const test = fromDate(date);

            const isValid = test && isEqual(fields, test);

            onChange(isValid ? date : undefined);
        }
        // To work around object identity comparison of "fields"
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(fields), onChange]);

    const form: typeof f = { ...f, setValue: setFormattedValue };
    const isInvalid = hasAllParts(fields) && Object.keys(errors).length > 0;

    const triggerDateValidation = useCallback(() => {
        if (formState.touched[fieldNames.date]) {
            setTimeout(() => trigger(fieldNames.date), 0);
        }
    }, [formState, trigger]);

    const validateDate = useCallback(
        (message: string): Validate => (date?: string) => {
            const isDateInvalid =
                fields.year &&
                fields.month &&
                date &&
                !isValidDate({
                    year: fields.year,
                    month: fields.month,
                    date,
                } as PartialDateParts);

            if (isDateInvalid) {
                return message;
            }

            return undefined;
        },
        [fields.year, fields.month]
    );

    useEffect(() => {
        if (formState.touched[fieldNames.date]) {
            trigger(fieldNames.date);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [validateDate]);

    return {
        isInvalid,
        form,
        fireOnChange,
        validateDate,
        triggerDateValidation,
        isFocused,
        setIsFocused,
    };
}

interface TimeStampContextModel extends UseFormMethods<Partial<DateParts>> {
    setIsFocused: (v: boolean) => void;
    fireOnChange: () => void;
}

export const TimeStampContext = createContext<TimeStampContextModel>(
    {} as TimeStampContextModel
);
