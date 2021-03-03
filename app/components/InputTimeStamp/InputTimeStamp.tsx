/* eslint-disable radix */
import clsx from 'clsx';
import React, { useEffect, useReducer } from 'react';

import styles from './InputTimeStamp.module.scss';
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

function getFieldValue(v?: number): string {
    if (Number.isNaN(v) || v === undefined) {
        return '';
    }

    return `${v}`;
}

export default function InputTimeStamp({
    label,
    value,
    onChange,
}: InputTimeStampProps): JSX.Element {
    const [
        {
            year,
            month,
            date,
            hours,
            minutes,
            seconds,
            formattedDate,
            isInvalid,
        },
        dispatch,
    ] = useReducer(reducer, {});

    useEffect(() => {
        dispatch(update(value));
    }, [value]);

    useEffect(() => {
        onChange(formattedDate);
    }, [formattedDate, onChange]);

    return (
        <div className={styles.root}>
            {label}
            <div
                className={clsx(styles.input, isInvalid && styles.inputInvalid)}
            >
                <input
                    className={styles.year}
                    name="year"
                    type="string"
                    placeholder="YYYY"
                    value={getFieldValue(year)}
                    onChange={(e) =>
                        dispatch(setYear(parseInt(e.target.value)))
                    }
                />
                -
                <input
                    className={styles.field}
                    name="month"
                    type="string"
                    placeholder="MM"
                    value={getFieldValue(month)}
                    onChange={(e) =>
                        dispatch(setMonth(parseInt(e.target.value)))
                    }
                />
                -
                <input
                    className={styles.field}
                    name="date"
                    type="string"
                    placeholder="DD"
                    value={getFieldValue(date)}
                    onChange={(e) =>
                        dispatch(setDate(parseInt(e.target.value)))
                    }
                />
                <span>at</span>
                <input
                    className={styles.field}
                    name="hours"
                    type="string"
                    placeholder="HH"
                    value={getFieldValue(hours)}
                    onChange={(e) =>
                        dispatch(setHours(parseInt(e.target.value)))
                    }
                />
                :
                <input
                    className={styles.field}
                    name="minutes"
                    type="string"
                    placeholder="MM"
                    value={getFieldValue(minutes)}
                    onChange={(e) =>
                        dispatch(setMinutes(parseInt(e.target.value)))
                    }
                />
                :
                <input
                    className={styles.field}
                    name="seconds"
                    type="string"
                    placeholder="SS"
                    value={getFieldValue(seconds)}
                    onChange={(e) =>
                        dispatch(setSeconds(parseInt(e.target.value)))
                    }
                />
            </div>
        </div>
    );
}
