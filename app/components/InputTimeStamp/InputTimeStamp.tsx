/* eslint-disable radix */
import React, { useEffect, useReducer } from 'react';

// import styles from './InputTimeStamp.module.scss';
import {
    reducer,
    update,
    setYear,
    setMonth,
    setDate,
} from './inputTimeStampReducer';

export interface InputTimeStampProps {
    label?: string | JSX.Element;
    value?: Date;
    onChange(date: Date): void;
}

export default function InputTimeStamp({
    label,
    value,
    onChange,
}: InputTimeStampProps): JSX.Element {
    const [{ year, month, date, formattedDate }, dispatch] = useReducer(
        reducer,
        {}
    );

    useEffect(() => {
        dispatch(update(value));
    }, [value]);

    useEffect(() => {
        if (formattedDate) {
            onChange(formattedDate);
        }
    }, [formattedDate, onChange]);

    return (
        <div>
            <label>{label}</label>
            <br />
            {year}-{month}-{date}
            <br />
            Formatted: {formattedDate?.toDateString()}
            <br />
            Value: {value?.toDateString()}
            <br />
            <input
                name="year"
                type="string"
                placeholder="YYYY"
                value={`${year || ''}`}
                onChange={(e) => dispatch(setYear(parseInt(e.target.value)))}
            />
            <input
                name="month"
                type="string"
                placeholder="MM"
                value={`${month || ''}`}
                onChange={(e) => dispatch(setMonth(parseInt(e.target.value)))}
            />
            <input
                name="date"
                type="string"
                placeholder="DD"
                value={`${date || ''}`}
                onChange={(e) => dispatch(setDate(parseInt(e.target.value)))}
            />
        </div>
    );
}
