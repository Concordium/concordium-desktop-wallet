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
    INIT,
    SET_YEAR,
    SET_MONTH,
    SET_DATE,
}

interface Init extends ReduxAction<ActionType.INIT> {
    date?: Date;
}

export function init(date?: Date): Init {
    return { type: ActionType.INIT, date };
}

interface SetYear extends ReduxAction<ActionType.SET_YEAR> {
    year: number;
}

interface SetMonth extends ReduxAction<ActionType.SET_MONTH> {
    month: number;
}

interface SetDate extends ReduxAction<ActionType.SET_DATE> {
    date: number;
}

type Action = Init | SetYear | SetMonth | SetDate;

function formatDate(
    year?: number,
    month?: number,
    date?: number
): Date | undefined {
    if (!year || !month || !date) {
        return undefined;
    }

    const newDate = new Date();
    newDate.setFullYear(year);
    newDate.setMonth(month);
    newDate.setDate(date);
    return newDate;
}

function getDateParts(date?: Date): DateParts | undefined {
    if (!date) {
        return undefined;
    }

    const year = date.getFullYear();
    const month = date.getMonth();
    const d = date.getDate();

    return {
        year,
        month,
        date: d,
    };
}

export const reducer: Reducer<State, Action> = (s = {}, a) => {
    const { year, month, date } = getDateParts(s.formattedDate) ?? {};

    switch (a.type) {
        case ActionType.INIT:
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
