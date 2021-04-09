/* eslint-disable react-hooks/exhaustive-deps */
import clsx from 'clsx';
import React, {
    FocusEventHandler,
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

import styles from './InlineNumber.module.scss';

const ensureNumber = (v?: number): string =>
    v === undefined || Number.isNaN(v) ? '' : v.toString();

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
            'onBlur' | 'step' | 'min' | 'max'
        > {
    /**
     * Defaults to 0.
     */
    ensureDigits?: number;
    allowFractions?: boolean;
    label?: string;
    /**
     * Default is postfix.
     */
    labelPosition?: 'prefix' | 'postfix';
    value: number | undefined;
    /**
     * Defaults to 0. This is the value used if field is unfocused without a value.
     */
    defaultValue?: number;
    onChange(v?: number): void;
}

export default function InlineNumber({
    ensureDigits = 0,
    defaultValue = 0,
    value,
    onChange,
    onBlur = noOp,
    allowFractions = false,
    className,
    label,
    labelPosition = 'postfix',
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
        format(value ?? defaultValue)
    );

    const ref = useRef<HTMLInputElement>(null);

    const handleBlur: FocusEventHandler<HTMLInputElement> = useCallback(
        (e) => {
            if (!innerValue) {
                setInnerValue(format(defaultValue));
            } else {
                setInnerValue(format(value));
            }

            onBlur(e);
        },
        [format, onBlur, innerValue, defaultValue, value]
    );

    // Ensure value and defaultValue match on init
    useEffect(() => {
        if (defaultValue !== undefined && value === undefined) {
            skipUpdate.current = true;
            onChange(defaultValue);
        }
    }, []);

    useUpdateEffect(() => {
        onChange(parse(innerValue));
    }, [innerValue]);

    useUpdateEffect(() => {
        if (!skipUpdate.current) {
            setInnerValue(ensureNumber(value));
        }
        skipUpdate.current = false;
    }, [value]);

    useLayoutEffect(() => scaleFieldWidth(ref.current), [innerValue]);

    return (
        <label className={clsx(styles.root, className)}>
            {labelPosition === 'prefix' && label}
            <input
                className={styles.input}
                type="number"
                value={innerValue}
                onChange={(e) => setInnerValue(e.target.value)}
                onBlur={handleBlur}
                ref={ref}
                {...inputProps}
            />
            {labelPosition === 'postfix' && label}
        </label>
    );
}
