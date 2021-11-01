import React from 'react';
import ReactDatePicker from 'react-datepicker';
import { CommonInputProps } from '../common';

interface Props extends CommonInputProps {
    value: Date | undefined;
    onChange(v: Date): void;
    onBlur?(): void;
}

export default function DatePicker({ value, onChange, onBlur }: Props) {
    return (
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
    );
}
