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

export enum TimeConstants {
    Second = 1000,
    Minute = 60 * Second,
    Hour = 60 * Minute,
    Day = 24 * Hour,
    Week = 7 * Day,
    Month = 30 * Day,
}

export function getDefaultExpiry(): string {
    return (new Date().getTime() + TimeConstants.Hour).toString();
}
