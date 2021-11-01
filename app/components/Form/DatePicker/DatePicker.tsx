import clsx from 'clsx';
import React from 'react';
import ReactDatePicker, { ReactDatePickerProps } from 'react-datepicker';
import Label from '~/components/Label';
import { CommonInputProps } from '../common';
import ErrorMessage from '../ErrorMessage';

import styles from './DatePicker.module.scss';

interface Props
    extends CommonInputProps,
        Pick<ReactDatePickerProps, 'readOnly' | 'disabled'> {
    value: Date | undefined;
    placeholder?: string;
    onChange(v: Date): void;
    onBlur?(): void;
}

export default function DatePicker({
    value,
    onChange,
    onBlur,
    label,
    placeholder,
    isInvalid,
    error,
    ...props
}: Props) {
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
                placeholderText={placeholder}
                popperPlacement="bottom"
                className={clsx(isInvalid && styles.fieldInvalid)}
                {...props}
            />
            <ErrorMessage>{error}</ErrorMessage>
        </div>
    );
}
