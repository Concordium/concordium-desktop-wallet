/* eslint-disable import/no-duplicates */
import clsx from 'clsx';
import React, { useCallback } from 'react';
import ReactDatePicker, { ReactDatePickerProps } from 'react-datepicker';
import enGB from 'date-fns/locale/en-GB';
import { setHours, setMinutes } from 'date-fns';
import Label from '~/components/Label';
import { ClassName } from '~/utils/types';
import { CommonInputProps } from '../common';
import ErrorMessage from '../ErrorMessage';
import { isDateEqual } from '~/utils/timeHelpers';
import { noOp } from '~/utils/basicHelpers';

import styles from './DatePicker.module.scss';

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

/**
 * Component for picking date and time. Is also available as part of a <Form />.
 *
 * @example
 * const [v, s] = useState();
 *
 * <DatePicker value={v} onChange={s} />
 */
export default function DatePicker({
    value,
    onChange,
    onBlur = noOp,
    label,
    placeholder = 'YYYY-MM-DD at HH:MM:SS',
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
    const handleChange: typeof onChange = useCallback(
        (v) => {
            onChange(v);
            onBlur();
        },
        [onChange, onBlur]
    );

    return (
        <div className={clsx(styles.root, className)}>
            {label && <Label className="mB5">{label}</Label>}
            <ReactDatePicker
                selected={value}
                onChange={handleChange}
                onBlur={onBlur}
                showTimeSelect
                timeCaption="Time"
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="yyyy-MM-dd 'at' HH:mm:ss"
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
