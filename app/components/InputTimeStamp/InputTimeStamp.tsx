/* eslint-disable radix */
import React, { useEffect, useReducer } from 'react';

// import styles from './InputTimeStamp.module.scss';
import {
    reducer,
    update,
    setYear,
    setMonth,
    setDate,
    setHours,
    setMinutes,
    setSeconds,
} from './inputTimeStampReducer';

export interface InputTimeStampProps {
    label?: string | JSX.Element;
    value?: Date;
    onChange(date?: Date): void;
}

export default function InputTimeStamp({
    label,
    value,
    onChange,
}: InputTimeStampProps): JSX.Element {
    const [
        { year, month, date, hours, minutes, seconds, formattedDate },
        dispatch,
    ] = useReducer(reducer, {});

    useEffect(() => {
        dispatch(update(value));
    }, [value]);

    useEffect(() => {
        onChange(formattedDate);
    }, [formattedDate, onChange]);

    return (
        <div>
            <label>{label}</label>
            <br />
            {year}-{month}-{date} at {hours}:{minutes}:{seconds}
            <br />
            Formatted: {formattedDate?.toDateString()}
            <br />
            Value: {value?.toDateString()}
            <br />
            <input
                name="year"
                type="string"
                placeholder="YYYY"
                value={`${year ?? ''}`}
                onChange={(e) => dispatch(setYear(parseInt(e.target.value)))}
            />
            -
            <input
                name="month"
                type="string"
                placeholder="MM"
                value={`${month ?? ''}`}
                onChange={(e) => dispatch(setMonth(parseInt(e.target.value)))}
            />
            -
            <input
                name="date"
                type="string"
                placeholder="DD"
                value={`${date ?? ''}`}
                onChange={(e) => dispatch(setDate(parseInt(e.target.value)))}
            />
            at
            <input
                name="hours"
                type="string"
                placeholder="HH"
                value={`${hours ?? ''}`}
                onChange={(e) => dispatch(setHours(parseInt(e.target.value)))}
            />
            :
            <input
                name="minutes"
                type="string"
                placeholder="MM"
                value={`${minutes ?? ''}`}
                onChange={(e) => dispatch(setMinutes(parseInt(e.target.value)))}
            />
            :
            <input
                name="seconds"
                type="string"
                placeholder="SS"
                value={`${seconds ?? ''}`}
                onChange={(e) => dispatch(setSeconds(parseInt(e.target.value)))}
            />
        </div>
    );
}
