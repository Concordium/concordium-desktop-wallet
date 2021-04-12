/* eslint-disable react-hooks/exhaustive-deps */
import clsx from 'clsx';
import React, {
    InputHTMLAttributes,
    useCallback,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from 'react';
import { noOp } from '~/utils/basicHelpers';
import { useUpdateEffect } from '~/utils/hooks';
import { scaleFieldWidth } from '~/utils/htmlHelpers';
import { ClassName } from '~/utils/types';
import { CommonFieldProps } from '../common';

import styles from './InlineNumber.module.scss';

const ensureValidBigInt = (v = ''): string => {
    try {
        BigInt(v);
        return v;
    } catch {
        return '';
    }
};

const formatNumberString = (fractionDigits: number) => (v = ''): string => {
    const parsed = parseFloat(v);

    if (Number.isNaN(parsed)) {
        return '';
    }

    const valueFractionDigits = v.split('.')[1]?.length ?? 0;

    return parsed.toFixed(Math.max(fractionDigits, valueFractionDigits));
};

export interface InlineNumberProps
    extends ClassName,
        Pick<
            InputHTMLAttributes<HTMLInputElement>,
            'step' | 'min' | 'max' | 'disabled'
        >,
        Pick<CommonFieldProps, 'isInvalid'> {
    /**
     * Amount of digits to ensure in rendered value (e.g. `3` => `0.000`). Defaults to `0`.
     */
    ensureDigits?: number;
    /**
     * Whether to work with floats or integers. Defaults to `false`.
     */
    allowFractions?: boolean;
    value: string | undefined;
    /**
     * Defaults to `0`. This is the value used if field is unfocused without a value.
     */
    fallbackValue?: number | bigint;
    /**
     * If true, falls back to `fallbackValue` when fields `isInvalid` prop is set to `true` on blur. Defaults to `false`.
     */
    fallbackOnInvalid?: boolean;
    onChange(v?: string): void;
    /**
     * As internal formatting functionality is triggered on blur, settings value on blur externally is prone to trigger an infinite loop. Please take caution!
     */
    onBlur?(): void;
    onFocus?(): void;
}

/**
 * Number input that aligns with surrouding content in an inline fashion. Is also available as sub-component on \<Form /\>
 *
 * @example
 * I would like to submit the transaction in <InlineNumber value={value} onChange={setValue} label=" Releases" />.
 */
export default function InlineNumber({
    ensureDigits = 0,
    fallbackValue = 0,
    fallbackOnInvalid = false,
    value,
    onChange,
    onBlur = noOp,
    onFocus = noOp,
    allowFractions = false,
    className,
    isInvalid = false,
    ...inputProps
}: InlineNumberProps): JSX.Element {
    const format = useCallback(
        allowFractions ? formatNumberString(ensureDigits) : ensureValidBigInt,
        [ensureDigits, allowFractions]
    );

    const [innerValue, setInnerValue] = useState<string>(
        format(value ?? fallbackValue.toString())
    );
    const [isFocused, setIsFocused] = useState<boolean>(false);

    const ref = useRef<HTMLInputElement>(null);
    useLayoutEffect(() => {
        scaleFieldWidth(ref.current);
    }, [innerValue]);

    const handleBlur = useCallback(() => {
        // Basically ensure correct formatting of field and that field has a value (otherwise it'll be invisible on screen)
        if (!innerValue || (fallbackOnInvalid && isInvalid)) {
            setInnerValue(format(fallbackValue.toString()));
        } else {
            setInnerValue(format(value));
        }

        setIsFocused(false);
        onBlur();
    }, [
        format,
        onBlur,
        innerValue,
        fallbackValue,
        value,
        fallbackOnInvalid,
        isInvalid,
    ]);

    const handleFocus = useCallback(() => {
        setIsFocused(true);
        onFocus();
    }, [onFocus]);

    useEffect(() => {
        onChange(innerValue);
    }, [innerValue]);

    useUpdateEffect(() => {
        if (!isFocused) {
            setInnerValue(format(value));
        }
    }, [value]);

    return (
        <input
            className={clsx(
                styles.input,
                isInvalid && styles.invalid,
                className
            )}
            type="number"
            value={innerValue}
            onChange={(e) => setInnerValue(e.target.value)}
            onBlur={handleBlur}
            onFocus={handleFocus}
            ref={ref}
            {...inputProps}
            style={{ width: 5 }} // To prevent initial UI jitter.
        />
    );
}
