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

const formatValue = (fractionDigits: number) => (v?: number): string => {
    if (v === undefined || Number.isNaN(v)) {
        return '';
    }

    const valueFractionDigits = v.toString().split('.')[1]?.length ?? 0;

    return v.toFixed(Math.max(fractionDigits, valueFractionDigits));
};

const parseValue = (parser: typeof parseFloat | typeof parseInt) => (
    v: string
): number | undefined => {
    const parsed = parser(v);

    return Number.isNaN(parsed) ? undefined : parsed;
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
    value: number | undefined;
    /**
     * Defaults to `0`. This is the value used if field is unfocused without a value.
     */
    fallbackValue?: number;
    /**
     * If true, falls back to `fallbackValue` when fields `isInvalid` prop is set to `true` on blur. Defaults to `false`.
     */
    fallbackOnInvalid?: boolean;
    onChange(v?: number): void;
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
    const skipUpdate = useRef(false);
    const format = useCallback(formatValue(allowFractions ? ensureDigits : 0), [
        ensureDigits,
        allowFractions,
    ]);
    const parse = useCallback(
        parseValue(allowFractions ? parseFloat : parseInt),
        [allowFractions]
    );

    const [innerValue, setInnerValue] = useState<string>(
        format(value ?? fallbackValue)
    );
    const [isFocused, setIsFocused] = useState<boolean>(false);

    const ref = useRef<HTMLInputElement>(null);
    useLayoutEffect(() => scaleFieldWidth(ref.current), [innerValue]);

    const handleBlur = useCallback(() => {
        // Basically ensure correct formatting of field and that field has a value (otherwise it'll be invisible on screen)
        if (!innerValue || (fallbackOnInvalid && isInvalid)) {
            setInnerValue(format(fallbackValue));
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

    // Ensure value and defaultValue match on init
    useEffect(() => {
        if (fallbackValue !== undefined && value === undefined) {
            skipUpdate.current = true;
            onChange(fallbackValue);
        }
    }, []);

    useUpdateEffect(() => {
        onChange(parse(innerValue));
    }, [innerValue]);

    useUpdateEffect(() => {
        if (!skipUpdate.current && !isFocused) {
            setInnerValue(format(value));
        }
        skipUpdate.current = false;
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
