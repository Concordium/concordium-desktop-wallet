/* eslint-disable no-case-declarations */
import { DeepMap, FieldError } from 'react-hook-form';
import { Reducer, Action as ReduxAction } from 'redux';

export interface DateParts {
    year: number;
    month: number;
    date: number;
    hours: number;
    minutes: number;
    seconds: number;
}

export type DatePartsStrings = { [P in keyof DateParts]: string };

interface State extends Partial<DateParts> {
    formattedDate?: Date;
    isInvalid?: boolean;
    updateForm: boolean;
}

enum ActionType {
    UPDATE_DATE,
    UPDATE_PARTS,
}

interface UpdateDate extends ReduxAction<ActionType.UPDATE_DATE> {
    date?: Date;
}

export function updateDate(date?: Date): UpdateDate {
    return { type: ActionType.UPDATE_DATE, date };
}

interface UpdateParts extends ReduxAction<ActionType.UPDATE_PARTS> {
    parts?: Partial<DatePartsStrings>;
    errors?: DeepMap<DatePartsStrings, FieldError>;
}

export function updateParts(
    parts?: Partial<DatePartsStrings>,
    errors?: DeepMap<DatePartsStrings, FieldError>
): UpdateParts {
    return { type: ActionType.UPDATE_PARTS, parts, errors };
}

type Action = UpdateDate | UpdateParts;

function hasAllParts(date: Partial<DateParts> = {}): date is DateParts {
    return (
        date.year !== undefined &&
        date.month !== undefined &&
        date.date !== undefined &&
        date.hours !== undefined &&
        date.minutes !== undefined &&
        date.seconds !== undefined
    );
}

function fromDateParts(date: DateParts): Date {
    return new Date(
        date.year,
        date.month - 1,
        date.date,
        date.hours,
        date.minutes,
        date.seconds
    );
}

function fromDate(date: Date): DateParts {
    return {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        date: date.getDate(),
        hours: date.getHours(),
        minutes: date.getMinutes(),
        seconds: date.getSeconds(),
    };
}

function dateExists(date: Partial<DateParts>): date is DateParts {
    if (!hasAllParts(date)) {
        return false;
    }

    const test = fromDateParts(date);

    // Checking this way relies on Date overflow logic, i.e. new Date(1999, 11, 32) -> 2000-00-01
    return (
        date.year === test.getFullYear() &&
        date.month === test.getMonth() + 1 &&
        date.date === test.getDate() &&
        date.hours === test.getHours() &&
        date.minutes === test.getMinutes() &&
        date.seconds === test.getSeconds()
    );
}

function formatDate(date?: Partial<DateParts>): Date | undefined {
    if (!date || !dateExists(date)) {
        return undefined;
    }

    return fromDateParts(date);
}

function getDateParts(date?: Date): DateParts | undefined {
    if (!date) {
        return undefined;
    }

    return fromDate(date);
}

function sanitizeParts(
    parts: Partial<DatePartsStrings> = {}
): Partial<DateParts> | undefined {
    return (Object.keys(parts) as Array<keyof DateParts>).reduce((acc, cur) => {
        // eslint-disable-next-line radix
        const v = parseInt(parts[cur] ?? '');

        return {
            ...acc,
            [cur]: Number.isNaN(v) ? undefined : v,
        };
    }, {});
}

export const reducer: Reducer<State, Action> = (
    s = { updateForm: false },
    a
) => {
    const next: State = { ...s, updateForm: false };

    switch (a.type) {
        case ActionType.UPDATE_DATE:
            return {
                ...next,
                ...getDateParts(a.date),
                formattedDate: a.date,
                updateForm:
                    a.date?.toISOString() !== s.formattedDate?.toISOString(),
            };
        case ActionType.UPDATE_PARTS:
            const newParts = sanitizeParts(a.parts);
            return {
                ...next,
                ...newParts,
                formattedDate: formatDate(newParts),
                isInvalid: hasAllParts(newParts)
                    ? Object.keys(a.errors ?? {}).length > 0 ||
                      !dateExists(newParts)
                    : undefined,
            };
        default:
            return s;
    }
};
