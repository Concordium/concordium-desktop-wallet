import React, { useEffect, useReducer } from 'react';

import styles from './InputTimeStamp.module.scss';
import { reducer, init } from './inputTimeStampReducer';

export interface InputTimeStampProps {
    label?: string | JSX.Element;
    initialValue?: Date;
    value?: Date;
    onChange(date: Date | null): void;
}

export default function InputTimeStamp({
    label,
    initialValue,
    value,
    onChange,
}: InputTimeStampProps): JSX.Element {
    const [{ year, month, date }, dispatch] = useReducer(reducer, {});

    useEffect(() => {
        dispatch(init(initialValue));
    }, [initialValue]);

    return (
        <div>
            <label>{label}</label>
            {year}, {month}, {date}
            <input name="year" type="number" placeholder="YYYY" />
            <input name="month" type="number" placeholder="MM" />
            <input name="date" type="number" placeholder="DD" />
            <input
                className={styles.dateField}
                type="date"
                value={value?.toDateString()}
                onChange={(e) => onChange(e.target.valueAsDate)}
            />
        </div>
    );
}
