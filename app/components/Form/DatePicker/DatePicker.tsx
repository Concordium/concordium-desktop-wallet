import React from 'react';
import ReactDatePicker from 'react-datepicker';
import Label from '~/components/Label';
import { CommonInputProps } from '../common';

import styles from './DatePicker.module.scss';

interface Props extends CommonInputProps {
    value: Date | undefined;
    onChange(v: Date): void;
    onBlur?(): void;
}

export default function DatePicker({ value, onChange, onBlur, label }: Props) {
    return (
        <div className={styles.root}>
            {label && <Label>{label}</Label>}
            <ReactDatePicker
                selected={value}
                onChange={onChange}
                onBlur={onBlur}
                showTimeSelect
                timeCaption="Time"
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="dd-MM-yyyy 'at' HH:mm:ss"
            />
        </div>
    );
}
