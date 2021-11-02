/* eslint-disable import/no-duplicates */
import clsx from 'clsx';
import React from 'react';
import ReactDatePicker, { ReactDatePickerProps } from 'react-datepicker';
import enGB from 'date-fns/locale/en-GB';
import { setHours, setMinutes } from 'date-fns';
import Label from '~/components/Label';
import { ClassName } from '~/utils/types';
import { CommonInputProps } from '../common';
import ErrorMessage from '../ErrorMessage';

import styles from './DatePicker.module.scss';
import { isDateEqual } from '~/utils/timeHelpers';

interface Props
    extends CommonInputProps,
        ClassName,
        Pick<
            ReactDatePickerProps,
            | 'readOnly'
            | 'disabled'
            | 'minDate'
            | 'maxDate'
            | 'minTime'
            | 'maxTime'
        > {
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
    placeholder = 'DD-MM-YYYY at HH:MM:SS',
    isInvalid,
    error,
    className,
    minDate,
    maxDate,
    minTime = value && minDate && isDateEqual(value, minDate)
        ? minDate
        : setHours(setMinutes(new Date(), 0), 0),
    maxTime = value && maxDate && isDateEqual(value, maxDate)
        ? maxDate
        : setHours(setMinutes(new Date(), 59), 23),
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
                minTime={minTime}
                maxTime={maxTime}
                minDate={minDate}
                maxDate={maxDate}
                {...props}
            />
            <ErrorMessage>{error}</ErrorMessage>
        </div>
    );
}
