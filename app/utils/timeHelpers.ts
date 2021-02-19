import { TimeStampUnit, YearMonth } from './types';

// given a YearMonth string (YYYYMM), returns
// a displayable format eg:
// given "202001" => "January 2020"
export function formatDate(date: YearMonth) {
    const dtFormat = new Intl.DateTimeFormat('en-GB', {
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
    });
    return dtFormat.format(new Date(`${date.slice(0, 4)}-${date.slice(4, 6)}`));
}

/**
 * Given a unix timeStamp, return the date and time in a displayable format.
 * Assumes the timestamp is in seconds, otherwise the unit should be specified.
 */
export function parseTime(
    timeStamp: string,
    unit: TimeStampUnit = TimeStampUnit.seconds,
    formatOptions: Intl.DateTimeFormatOptions = {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error : https://github.com/microsoft/TypeScript/issues/35865
        dateStyle: 'short',
        timeStyle: 'short',
    }
) {
    const dtFormat = new Intl.DateTimeFormat('en-GB', formatOptions);

    const timeStampCorrectUnit = parseInt(timeStamp, 10) * unit;
    return dtFormat.format(new Date(timeStampCorrectUnit));
}

/**
 * Given a unix timeStamp, return the date in ISO formatted string.
 * Assumes the timestamp is in seconds, otherwise the unit should be specified.
 */
export function getISOFormat(
    timeStamp: string,
    unit: TimeStampUnit = TimeStampUnit.seconds
) {
    const timeStampCorrectUnit = parseInt(timeStamp, 10) * unit;
    return new Date(timeStampCorrectUnit).toISOString();
}

const second = 1000;

export interface Interval {
    label: string;
    value: number;
}
export const intervals: Interval[] = [
    { label: 'Minute', value: 60 * second },
    { label: 'Hour', value: 60 * 60 * second },
    { label: 'Day', value: 24 * 60 * 60 * second },
    { label: 'Week', value: 7 * 24 * 60 * 60 * second },
    { label: 'Month (30 days)', value: 30 * 7 * 24 * 60 * 60 * second },
];

export function getDefaultExpiry(): string {
    return (new Date().getTime() + 60 * 60 * second).toString(); // 1 hour from now
}
