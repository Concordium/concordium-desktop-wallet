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

import styles from './RewardDistribution.module.scss';

function scaleField(el: HTMLInputElement | null) {
    if (!el) {
        return;
    }

    setTimeout(() => {
        el.style.width = '5px';
        el.style.width = `${el.scrollWidth}px`;
    }, 0);
}

function formatValue(v?: number): string {
    if (v === undefined || Number.isNaN(v)) {
        return '';
    }

    return (v / 1000).toFixed(3);
}

function parseValue(v: string): number {
    const parsed = parseFloat(v);

    return Math.round(parsed * 1000);
}

function isValid(v: number): boolean {
    return !Number.isNaN(v) && v <= 100000 && v >= 0;
}

const noOp = () => null;

interface RewardDistributionFieldProps
    extends Pick<
        InputHTMLAttributes<HTMLInputElement>,
        'disabled' | 'className'
    > {
    label: string;
    value: number;
    isInvalid?: boolean;
    onBlur?(v: number): void;
}

export default function RewardDistributionField({
    label,
    className,
    isInvalid = false,
    value,
    onBlur = noOp,
    ...inputProps
}: RewardDistributionFieldProps): JSX.Element {
    const ref = useRef<HTMLInputElement>(null);
    const [stringValue, setStringValue] = useState(formatValue(value));

    const setInternalValue = useCallback((v: string) => {
        scaleField(ref.current);
        setStringValue(v);
    }, []);

    const handleBlur: FocusEventHandler<HTMLInputElement> = useCallback(
        (e) => {
            const v = parseValue(e.target.value);

            if (isValid(v)) {
                setInternalValue(formatValue(v));
                onBlur(v);
            } else {
                setInternalValue(formatValue(value));
            }
        },
        [onBlur, value, setInternalValue]
    );

    useEffect(() => setInternalValue(formatValue(value)), [value]);
    useLayoutEffect(() => scaleField(ref.current), []);

    return (
        <label
            className={clsx(
                styles.field,
                isInvalid && styles.fieldInvalid,
                className
            )}
        >
            <span className={styles.fieldTitle}>{label}</span>
            <div className={styles.inputWrapper}>
                <input
                    ref={ref}
                    {...inputProps}
                    value={stringValue}
                    onChange={(e) => setInternalValue(e.target.value)}
                    onBlur={handleBlur}
                />
                <span>%</span>
            </div>
        </label>
    );
}
