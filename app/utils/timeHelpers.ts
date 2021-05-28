import { ensureNumberLength } from './basicHelpers';
import { TimeStampUnit, YearMonth, YearMonthDate } from './types';

/**
 * given a YearMonth | YearMonthDate string (YYYYMM | YYYYMMDD), returns
 * a displayable format.
 *
 * @example
 * formatDate("202001") => "January 2020"
 * formatDate("20200101") => "01 January 2020"
 */
export function formatDate(date: YearMonth | YearMonthDate) {
    const y = date.slice(0, 4);
    const m = date.slice(4, 6);
    const d = date.slice(6, 8);

    const dtFormat = new Intl.DateTimeFormat('en-GB', {
        day: d ? '2-digit' : undefined,
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
    });

    return dtFormat.format(new Date(`${y}-${m}${d ? `-${d}` : ''}`));
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
    const dtFormat = new Intl.DateTimeFormat('en-ZA', formatOptions);

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

// default expiry on transactions (1 hour from now).
export function getDefaultExpiry() {
    return new Date(Date.now() + TimeConstants.Hour);
}

/** Convert a date to seconds since Unix epoch */
export function secondsSinceUnixEpoch(date: Date) {
    return Math.floor(date.getTime() / 1000);
}

/**
 * Given a date, return a new date, which is the next whole hour, i.e. f(13.14) = 14.00.
 * N.B. if the given date is already the whole hour, the same date is returned. i.e. f(13.00:00) = 13.00:00.
 *  @param baseline the date from which to get the next whole hour.
 *  @param hoursToIncrease optional parameter, increases the output by the given number of hours. i.e. f(13.14, 2) = 16.
 */
export function getNextWholeHour(baseline: Date, hoursToIncrease = 0) {
    const date = new Date(baseline.getTime());
    if (date.getSeconds() === 0 && date.getMinutes() === 0) {
        date.setHours(date.getHours() + hoursToIncrease);
    } else {
        date.setSeconds(0);
        date.setMinutes(0);
        date.setHours(date.getHours() + hoursToIncrease + 1);
    }
    return date;
}

export function getDefaultScheduledStartTime() {
    return getNextWholeHour(new Date(), 2);
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

/** Predicates whether a date is in the future based on the current time,
 * sampled at time of call */
export function isFutureDate(date: Date) {
    const now = new Date();
    return now < date;
}

/** Subtract a number of hours from a date */
export function subtractHours(hours: number, date: Date) {
    const before = new Date(date);
    before.setHours(before.getHours() - hours);
    return before;
}
