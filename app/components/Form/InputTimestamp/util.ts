/* eslint-disable radix */
import {
    dateFromDateParts,
    DateParts,
    datePartsFromDate,
} from '~/utils/timeHelpers';
import { EqualRecord } from '~/utils/types';

export interface InputTimestampRef {
    clear(): void;
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

export type PartialDateParts = Pick<DateParts, 'year' | 'month' | 'date'> &
    Partial<Omit<DateParts, 'year' | 'month' | 'date'>>;

export const isValidDate = (parts: PartialDateParts): boolean => {
    const t: DateParts = {
        ...parts,
        hours: parts.hours || '0',
        minutes: parts.minutes || '0',
        seconds: parts.seconds || '0',
    };
    const date = dateFromDateParts(t);
    const test = datePartsFromDate(date);

    const isValid = test !== undefined && isEqual(t, test);

    return isValid;
};
