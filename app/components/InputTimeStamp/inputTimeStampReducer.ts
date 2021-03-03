import { Reducer, Action as ReduxAction } from 'redux';

interface DateParts {
    year: number;
    month: number;
    date: number;
}

interface State extends Partial<DateParts> {
    formattedDate?: Date;
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

function formatDate(
    year?: number,
    month?: number,
    date?: number
): Date | undefined {
    console.log(year, month, date);

    if (!year || !month || !date) {
        return undefined;
    }

    return new Date(year, month - 1, date);
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
    const { year, month, date } = s;

    console.log(a);

    switch (a.type) {
        case ActionType.UPDATE:
            return {
                ...(getDateParts(a.date) ?? {}),
                formattedDate: a.date,
            };
        case ActionType.SET_YEAR:
            return {
                ...s,
                year: a.year,
                formattedDate: formatDate(a.year, month, date),
            };
        case ActionType.SET_MONTH:
            return {
                ...s,
                month: a.month,
                formattedDate: formatDate(year, a.month, date),
            };
        case ActionType.SET_DATE:
            return {
                ...s,
                date: a.date,
                formattedDate: formatDate(year, month, a.date),
            };
        default:
            return s;
    }
};
