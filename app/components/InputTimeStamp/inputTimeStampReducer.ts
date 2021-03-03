import { Reducer, Action as ReduxAction } from 'redux';

interface DateParts {
    year: number;
    month: number;
    date: number;
    hours: number;
    minutes: number;
    seconds: number;
}

interface State extends Partial<DateParts> {
    formattedDate?: Date;
    isValid?: boolean;
}

enum ActionType {
    UPDATE,
    SET_YEAR,
    SET_MONTH,
    SET_DATE,
    SET_HOURS,
    SET_MINUTES,
    SET_SECONDS,
}

interface Update extends ReduxAction<ActionType.UPDATE> {
    date?: Date;
}

export function update(date?: Date): Update {
    return { type: ActionType.UPDATE, date };
}

interface SetYear extends ReduxAction<ActionType.SET_YEAR> {
    year: number;
}

export function setYear(year: number): SetYear {
    return { type: ActionType.SET_YEAR, year };
}

interface SetMonth extends ReduxAction<ActionType.SET_MONTH> {
    month: number;
}

export function setMonth(month: number): SetMonth {
    return { type: ActionType.SET_MONTH, month };
}

interface SetDate extends ReduxAction<ActionType.SET_DATE> {
    date: number;
}

export function setDate(date: number): SetDate {
    return { type: ActionType.SET_DATE, date };
}

interface SetHours extends ReduxAction<ActionType.SET_HOURS> {
    hours: number;
}

export function setHours(hours: number): SetHours {
    return { type: ActionType.SET_HOURS, hours };
}

interface SetMinutes extends ReduxAction<ActionType.SET_MINUTES> {
    minutes: number;
}

export function setMinutes(minutes: number): SetMinutes {
    return { type: ActionType.SET_MINUTES, minutes };
}

interface SetSeconds extends ReduxAction<ActionType.SET_SECONDS> {
    seconds: number;
}

export function setSeconds(seconds: number): SetSeconds {
    return { type: ActionType.SET_SECONDS, seconds };
}

type Action =
    | Update
    | SetYear
    | SetMonth
    | SetDate
    | SetHours
    | SetMinutes
    | SetSeconds;

function hasAllParts(date: Partial<DateParts>): date is DateParts {
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

    return (
        date.year === test.getFullYear() &&
        date.month === test.getMonth() + 1 &&
        date.date === test.getDate() &&
        date.hours === test.getHours() &&
        date.minutes === test.getMinutes() &&
        date.seconds === test.getSeconds()
    );
}

function formatDate(date: Partial<DateParts>): Date | undefined {
    if (!dateExists(date)) {
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

export const reducer: Reducer<State, Action> = (s = {}, a) => {
    let next: State = s;

    switch (a.type) {
        case ActionType.UPDATE:
            next = {
                ...s,
                ...(getDateParts(a.date) ?? {}),
            };
            break;
        case ActionType.SET_YEAR:
            next = { ...s, year: a.year };
            break;
        case ActionType.SET_MONTH:
            next = { ...s, month: a.month };
            break;
        case ActionType.SET_DATE:
            next = { ...s, date: a.date };
            break;
        case ActionType.SET_HOURS:
            next = { ...s, hours: a.hours };
            break;
        case ActionType.SET_MINUTES:
            next = { ...s, minutes: a.minutes };
            break;
        case ActionType.SET_SECONDS:
            next = { ...s, seconds: a.seconds };
            break;
        default:
            return s;
    }

    next = {
        ...next,
        formattedDate: a.type === ActionType.UPDATE ? a.date : formatDate(next),
    };

    console.log(next);

    return {
        ...next,
        isValid: hasAllParts(next) ? dateExists(next) : undefined,
    };
};
