/* eslint-disable react-hooks/exhaustive-deps */
import clsx from 'clsx';
import React, {
    ChangeEventHandler,
    FocusEventHandler,
    InputHTMLAttributes,
    useCallback,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from 'react';

import styles from './RewardDistribution.module.scss';
import {
    fractionResolution,
    fractionResolutionToPercentage,
    percentageToFractionResolution,
} from '~/utils/rewardFractionHelpers';
import { noOp } from '~/utils/basicHelpers';
import { scaleFieldWidth } from '~/utils/htmlHelpers';

function formatValue(v?: number): string {
    if (v === undefined || Number.isNaN(v)) {
        return '';
    }

    return fractionResolutionToPercentage(v).toFixed(3);
}

function parseValue(v: string): number {
    const parsed = parseFloat(v);

    return Math.round(percentageToFractionResolution(parsed));
}

function isValid(v: number): boolean {
    return !Number.isNaN(v) && v <= fractionResolution && v >= 0;
}

interface RewardDistributionFieldProps
    extends Pick<
        InputHTMLAttributes<HTMLInputElement>,
        'disabled' | 'className' | 'onFocus' | 'onBlur'
    > {
    label: string;
    value: number;
    isInvalid?: boolean;
    onChange?(v: number): void;
}

export default function RewardDistributionField({
    label,
    className,
    isInvalid = false,
    value,
    onChange = noOp,
    onFocus = noOp,
    onBlur = noOp,
    ...inputProps
}: RewardDistributionFieldProps): JSX.Element {
    const ref = useRef<HTMLInputElement>(null);
    const [stringValue, setStringValue] = useState(formatValue(value));
    const [isFocused, setIsFocused] = useState(false);
    const { disabled } = inputProps;

    const setInternalValue = useCallback((v: string) => {
        scaleFieldWidth(ref.current);
        setStringValue(v);
    }, []);

    const handleFocus: FocusEventHandler<HTMLInputElement> = useCallback(
        (e) => {
            setIsFocused(true);
            onFocus(e);
        },
        [setIsFocused, onFocus]
    );

    const handleBlur: FocusEventHandler<HTMLInputElement> = useCallback(
        (e) => {
            setIsFocused(false);
            onBlur(e);

            const parsed = parseValue(e.target.value);

            if (isValid(parsed)) {
                setInternalValue(formatValue(parsed));
                onChange(parsed);
            } else {
                setInternalValue(formatValue(value));
            }
        },
        [onBlur, onChange, value, setInternalValue]
    );

    const handleChange: ChangeEventHandler<HTMLInputElement> = useCallback(
        (e) => {
            const v = e.target.value;
            setInternalValue(v);

            if (v.endsWith('.')) {
                return;
            }

            const parsed = parseValue(v);

            if (isValid(parsed)) {
                onChange(parsed);
            }
        },
        [onChange, setInternalValue]
    );

    useEffect(() => {
        if (!isFocused) {
            setInternalValue(formatValue(value));
        }
    }, [value]);

    useLayoutEffect(() => scaleFieldWidth(ref.current), []);

    return (
        <label
            className={clsx(
                styles.field,
                isInvalid && styles.fieldInvalid,
                disabled && styles.fieldDisabled,
                className
            )}
        >
            <span className={styles.fieldTitle}>{label}</span>
            <div className={styles.inputWrapper}>
                <input
                    ref={ref}
                    {...inputProps}
                    value={stringValue}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    onFocus={handleFocus}
                />
                <span>%</span>
            </div>
        </label>
    );
}
