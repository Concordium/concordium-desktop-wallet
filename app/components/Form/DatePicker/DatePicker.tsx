import clsx from 'clsx';
import React from 'react';
import ReactDatePicker, { ReactDatePickerProps } from 'react-datepicker';
import enGB from 'date-fns/locale/en-GB';
import Label from '~/components/Label';
import { ClassName } from '~/utils/types';
import { CommonInputProps } from '../common';
import ErrorMessage from '../ErrorMessage';

import styles from './DatePicker.module.scss';

interface Props
    extends CommonInputProps,
        ClassName,
        Pick<ReactDatePickerProps, 'readOnly' | 'disabled'> {
    value: Date | undefined;
    placeholder?: string;
    minDate?: Date;
    maxDate?: Date;
    onChange(v: Date): void;
    onBlur?(): void;
}

export default function DatePicker({
    value,
    onChange,
    onBlur,
    label,
    placeholder = 'DD-MM-YYYY at HH:MM:SS',
    isInvalid,
    error,
    className,
    ...props
}: Props) {
    return (
        <div className={clsx(styles.root, className)}>
            {label && <Label className="mB5">{label}</Label>}
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
                locale={enGB}
                {...props}
            />
            <ErrorMessage>{error}</ErrorMessage>
        </div>
    );
}
