import clsx from 'clsx';
import React, {
    FocusEventHandler,
    InputHTMLAttributes,
    useCallback,
    useEffect,
    useState,
} from 'react';

import styles from './RewardDistribution.module.scss';

function formatValue(v?: number): string {
    if (v === undefined || Number.isNaN(v)) {
        return '';
    }

    return v.toFixed(3);
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
    const [stringValue, setStringValue] = useState(formatValue(value));

    const handleBlur: FocusEventHandler<HTMLInputElement> = useCallback(
        (e) => {
            onBlur(parseFloat(e.target.value));
        },
        [onBlur]
    );

    useEffect(() => setStringValue(formatValue(value)), [value]);

    return (
        <label
            className={clsx(
                styles.field,
                isInvalid && styles.fieldInvalid,
                className
            )}
        >
            {label}
            <input
                {...inputProps}
                value={stringValue}
                onChange={(e) => setStringValue(e.target.value)}
                onBlur={handleBlur}
            />
        </label>
    );
}
