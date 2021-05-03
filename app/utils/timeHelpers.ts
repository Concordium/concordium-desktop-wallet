import { ensureNumberLength } from './basicHelpers';
import { TimeStampUnit, YearMonth } from './types';

/**
 * given a YearMonth string (YYYYMM), returns
 * a displayable format eg:
 * given "202001" => "January 2020"
 */
export function formatDate(date: YearMonth) {
    const dtFormat = new Intl.DateTimeFormat('en-GB', {
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
    });
    return dtFormat.format(new Date(`${date.slice(0, 4)}-${date.slice(4, 6)}`));
}

// Returns the YearMonth string (YYYYMM), of the current time.
export function getCurrentYearMonth(): YearMonth {
    const date = new Date();
    let month = (date.getMonth() + 1).toString();
    if (month.length === 1) {
        month = `0${month}`;
    }
    return date.getFullYear() + month;
}

/**
 * Given a unix timeStamp, return the date and time in a displayable format.
 * Assumes the timestamp is in seconds, otherwise the unit should be specified.
 */
export function parseTime(
    timeStamp: string,
    unit: TimeStampUnit = TimeStampUnit.seconds,
    formatOptions: Intl.DateTimeFormatOptions = {
        dateStyle: 'short',
        timeStyle: 'short',
    }
) {
    const dtFormat = new Intl.DateTimeFormat('en-GB', formatOptions);

    const timeStampCorrectUnit = parseInt(timeStamp, 10) * unit;
    return dtFormat.format(new Date(timeStampCorrectUnit));
}

export const dateFromTimeStamp = (
    timeStamp: string | bigint,
    unit: TimeStampUnit = TimeStampUnit.seconds
): Date => new Date(parseInt(timeStamp.toString(), 10) * unit);

/**
 * Given a unix timeStamp, return the date in ISO formatted string.
 * Assumes the timestamp is in seconds, otherwise the unit should be specified.
 */
export const getISOFormat = (
    timeStamp: string | bigint,
    unit: TimeStampUnit = TimeStampUnit.seconds
) => dateFromTimeStamp(timeStamp, unit).toISOString();

export enum TimeConstants {
    Second = 1000,
    Minute = 60 * Second,
    Hour = 60 * Minute,
    Day = 24 * Hour,
    Week = 7 * Day,
    Month = 30 * Day,
}

// default expiry on transactions (1 hour from now), given in seconds.
export function getDefaultExpiry(): bigint {
    return BigInt(
        Math.floor((new Date().getTime() + TimeConstants.Hour) / 1000)
    );
}

export function getNow(
    unit: TimeStampUnit = TimeStampUnit.milliSeconds
): number {
    return Math.floor(new Date().getTime() / unit);
}

export interface DateParts {
    year: string;
    month: string;
    date: string;
    hours: string;
    minutes: string;
    seconds: string;
}

interface TimeParts {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

/**
 * Converts miliseconds into days, hours, minutes, and seconds.
 *
 * @param miliseconds time to convert in ms.
 *
 * @example
 * convertMiliseconds(1000) => { ..., seconds: 1 };
 * convertMiliseconds(1000 * 3603) => { days: 0, hours: 1, minutes: 0, seconds: 3 };
 * convertMiliseconds(1000 * 3600 * 36) => { days: 1, hours: 12, minutes: 0, seconds: 0 };
 */
export function msToTimeParts(
    miliseconds: number | undefined
): TimeParts | undefined {
    if (!miliseconds) {
        return undefined;
    }

    const totalSeconds = Math.floor(miliseconds / 1000);
    const totalMinutes = Math.floor(totalSeconds / 60);
    const totalHours = Math.floor(totalMinutes / 60);
    const days = Math.floor(totalHours / 24);

    const seconds = totalSeconds % 60;
    const minutes = totalMinutes % 60;
    const hours = totalHours % 24;

    return { days, hours, minutes, seconds };
}

export function datePartsFromDate(date?: Date): DateParts | undefined {
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

export function dateFromDateParts(date: DateParts): Date {
    return new Date(
        parseInt(date.year, 10),
        parseInt(date.month, 10) - 1,
        parseInt(date.date, 10),
        parseInt(date.hours, 10),
        parseInt(date.minutes, 10),
        parseInt(date.seconds, 10)
    );
}

type DatePartFormatters = { [key in keyof DateParts]: (v?: string) => string };

export const datePartFormatters: DatePartFormatters = {
    year: ensureNumberLength(4),
    month: ensureNumberLength(2),
    date: ensureNumberLength(2),
    hours: ensureNumberLength(2),
    minutes: ensureNumberLength(2),
    seconds: ensureNumberLength(2),
};

export const getFormattedDateString = (date: Date): string => {
    const parts = datePartsFromDate(date);

    if (!parts) {
        return '';
    }

    const p: DateParts = (Object.keys(parts) as Array<
        keyof DateParts
    >).reduce<DateParts>(
        (acc, k) => ({
            ...acc,
            [k]: datePartFormatters[k](parts[k]),
        }),
        {} as DateParts
    );

    const { year, month, date: d, hours, minutes, seconds } = p;

    return `${year}-${month}-${d} at ${hours}:${minutes}:${seconds}`;
};
