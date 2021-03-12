/* eslint-disable radix */
import { EqualRecord } from '../../../utils/types';

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

export function hasAllParts(parts: Partial<DateParts>): parts is DateParts {
    const values = Object.values(parts);
    return (
        values.length === Object.keys(fieldNames).length &&
        values.every((v) => !!v)
    );
}

export function fromDate(date?: Date): DateParts | undefined {
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

export function fromDateParts(date: DateParts): Date {
    return new Date(
        parseInt(date.year),
        parseInt(date.month) - 1,
        parseInt(date.date),
        parseInt(date.hours),
        parseInt(date.minutes),
        parseInt(date.seconds)
    );
}

export function isEqual(a: DateParts, b: DateParts): boolean {
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

export const formatters: Formatters = {
    year: ensureNumberLength(4),
    month: ensureNumberLength(2),
    date: ensureNumberLength(2),
    hours: ensureNumberLength(2),
    minutes: ensureNumberLength(2),
    seconds: ensureNumberLength(2),
};

export type PartialDateParts = Pick<DateParts, 'year' | 'month' | 'date'> &
    Partial<Omit<DateParts, 'year' | 'month' | 'date'>>;
export const isValidDate = (parts: PartialDateParts): boolean => {
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
