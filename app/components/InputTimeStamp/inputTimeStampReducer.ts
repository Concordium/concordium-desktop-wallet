import { Reducer, Action as ReduxAction } from 'redux';

interface DateParts {
    year: number;
    month: number;
    date: number;
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

type Action = Update | SetYear | SetMonth | SetDate;

function hasAllParts(date: Partial<DateParts>): date is DateParts {
    return (
        date.year !== undefined &&
        date.month !== undefined &&
        date.date !== undefined
    );
}

function dateExists(date: Partial<DateParts>): date is DateParts {
    if (!hasAllParts(date)) {
        return false;
    }

    const test = new Date(date.year, date.month - 1, date.date);

    return (
        date.year === test.getFullYear() &&
        date.month === test.getMonth() + 1 &&
        date.date === test.getDate()
    );
}

function formatDate(date: Partial<DateParts>): Date | undefined {
    if (!dateExists(date)) {
        return undefined;
    }

    return new Date(date.year, date.month - 1, date.date);
}

function getDateParts(date?: Date): DateParts | undefined {
    if (!date) {
        return undefined;
    }

    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const d = date.getDate();

    return {
        year,
        month,
        date: d,
    };
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
        default:
            return s;
    }

    next = {
        ...next,
        formattedDate: a.type === ActionType.UPDATE ? a.date : formatDate(next),
    };

    return {
        ...next,
        isValid: hasAllParts(next) ? dateExists(next) : undefined,
    };
};
