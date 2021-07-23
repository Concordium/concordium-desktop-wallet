import clsx from 'clsx';
import React, {
    InputHTMLAttributes,
    useCallback,
    useLayoutEffect,
    useRef,
    useState,
} from 'react';
import { noOp } from '~/utils/basicHelpers';
import { useUpdateEffect } from '~/utils/hooks';
import { scaleFieldWidth } from '~/utils/htmlHelpers';
import { CommonFieldProps } from '../common';

import styles from './InlineInput.module.scss';

export interface InlineInputProps
    extends Pick<
            InputHTMLAttributes<HTMLInputElement>,
            'type' | 'className' | 'autoFocus'
        >,
        CommonFieldProps {
    value: string;
    fallbackValue: string;
    onChange?(value: string): void;
    onBlur?(): void;
}

export default function InlineInput({
    isInvalid = false,
    className,
    type = 'text',
    value,
    fallbackValue,
    onChange = noOp,
    onBlur = noOp,
    error,
    ...props
}: InlineInputProps) {
    const ref = useRef<HTMLInputElement>(null);
    const [innerValue, setInnerValue] = useState(value);

    useLayoutEffect(() => {
        scaleFieldWidth(ref.current);
    }, [innerValue]);

    useUpdateEffect(() => {
        setInnerValue(value);
    }, [value]);

    const handleBlur = useCallback(() => {
        onBlur();
        if (!value) {
            onChange(fallbackValue);
        }
    }, [onBlur, value, fallbackValue, onChange]);

    return (
        <input
            className={clsx(
                styles.root,
                isInvalid && styles.invalid,
                className
            )}
            type={type}
            value={value}
            onChange={(e) => onChange(e.currentTarget.value)}
            onBlur={handleBlur}
            ref={ref}
            {...props}
            style={{ width: 6 }} // To prevent initial UI jitter.
        />
    );
}
