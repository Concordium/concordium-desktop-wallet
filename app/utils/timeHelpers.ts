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
 * Given a unix timeStamp, return the date in a displayable format.
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

export function getDate(
    timeStamp: string,
    unit: TimeStampUnit = TimeStampUnit.seconds
) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error : https://github.com/microsoft/TypeScript/issues/35865
    return parseTime(timeStamp, unit, { dateStyle: 'short' });
}

export function getTime(
    timeStamp: string,
    unit: TimeStampUnit = TimeStampUnit.seconds
) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error : https://github.com/microsoft/TypeScript/issues/35865
    return parseTime(timeStamp, unit, { timeStyle: 'short' });
}
