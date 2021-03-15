import React, { useCallback, useEffect } from 'react';

import { Controller, useForm } from 'react-hook-form';
import clsx from 'clsx';

import { EqualRecord } from '~/utils/types';

import RewardDistributionField from './RewardDistributionField';
import styles from './RewardDistribution.module.scss';

export interface RewardDistributionValue {
    first: number;
    second: number;
}

const fieldNames: EqualRecord<RewardDistributionValue> = {
    first: 'first',
    second: 'second',
};

const displayValue = (v: number): string => {
    if (Number.isInteger(v)) {
        return `${v}`;
    }

    return `~${Math.round(v)}`;
};

function formatInputValue(v: RewardDistributionValue): RewardDistributionValue {
    return {
        first: Math.round(v.first * 100000),
        second: Math.round(v.second * 100000),
    };
}

function formatOutputValue(
    v: RewardDistributionValue
): RewardDistributionValue {
    return {
        first: v.first / 100000,
        second: v.second / 100000,
    };
}

function belowTitleCutoff(width: number): boolean {
    return width < 30;
}

export interface RewardDistributionProps {
    /**
     * Labels for first, second and remaining reward party respectively.
     */
    labels: [string, string, string];
    /**
     * Value of first and second reward share in fractions of 100000 (e.g. 0.67812)
     */
    value: RewardDistributionValue;
    /**
     * Change handler. Ouputs reward share of first and second party in fractions of 100000  (e.g. 0.67812)
     */
    onChange(v: RewardDistributionValue): void;
}

/**
 * @description
 * Component for handling reward ratio of 2 parties, with the remainder implicitly going to a third party. Works with values of fractions of 100000.
 *
 * @example
 * const [value, setValue] = useState<RewardDistributionValue>({ first: 32145/100000, second: 50400/100000 });
 *
 * <RewardDistribution value={value} onChange={setValue} labels={['first', 'second', 'remaining']} />
 */
export default function RewardDistribution({
    labels,
    value: outerValue = { first: 0, second: 0 },
    onChange: fieldOnChange,
}: RewardDistributionProps): JSX.Element {
    const formattedValue = formatInputValue(outerValue);

    const form = useForm<RewardDistributionValue>({
        defaultValues: formattedValue,
    });
    const { first, second } = formattedValue;
    const remaining = 100000 - (first + second);

    const { watch, control, setValue } = form;
    const innerValues = watch();

    const firstLabel = labels[0];
    const secondLabel = labels[1];
    const remainingLabel = labels[2];

    const firstPercentage = first / 1000;
    const secondPercentage = second / 1000;
    const remainingPercentage = remaining / 1000;

    const handleBlur = useCallback(
        (
            name: keyof RewardDistributionValue,
            fieldChangeHandler: (v: number) => void,
            fieldBlurHandler: () => void
        ) => (v: number) => {
            fieldChangeHandler(v);
            fieldBlurHandler();

            const other = name === 'first' ? second : first;

            console.log('blur');

            if (v + other <= 100000) {
                fieldOnChange(
                    formatOutputValue({
                        first: name === 'first' ? v : innerValues.first,
                        second: name === 'second' ? v : innerValues.second,
                    })
                );
            } else {
                fieldOnChange(
                    formatOutputValue({
                        first: name === 'first' ? v : 100000 - v,
                        second: name === 'second' ? v : 100000 - v,
                    })
                );
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [JSON.stringify(innerValues), fieldOnChange]
    );

    useEffect(() => {
        setValue(fieldNames.first, first);
        setValue(fieldNames.second, second);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [first, second]);

    return (
        <div className={styles.root}>
            <header className={styles.header}>
                {first > 0 && (
                    <div
                        className={clsx(
                            styles.hFirst,
                            first > 0 && styles.hLeftEdge,
                            second === 0 && remaining === 0 && styles.hRightEdge
                        )}
                        style={{ width: `${firstPercentage}%` }}
                        title={firstLabel}
                    >
                        <div
                            className={clsx(
                                styles.hContent,
                                belowTitleCutoff(firstPercentage) &&
                                    styles.hContentNoTitle
                            )}
                        >
                            <span className={styles.hTitle}>{firstLabel}</span>
                            <span className={styles.hValue}>
                                {displayValue(firstPercentage)}%
                            </span>
                        </div>
                    </div>
                )}
                <div
                    className={clsx(
                        styles.hMiddle,
                        second === 0 && styles.hMiddleNoValue,
                        first === 100000 ||
                            (remaining === 100000 && styles.hMiddleHidden),
                        second > 0 && first === 0 && styles.hLeftEdge,
                        second > 0 && remaining === 0 && styles.hRightEdge
                    )}
                    style={{ width: `${secondPercentage}%` }}
                    title={secondLabel}
                >
                    <div
                        className={clsx(
                            styles.hContent,
                            belowTitleCutoff(secondPercentage) &&
                                styles.hContentNoTitle
                        )}
                    >
                        <span className={styles.hTitle}>{secondLabel}</span>
                        <span className={styles.hValue}>
                            {displayValue(secondPercentage)}%
                        </span>
                    </div>
                </div>
                {remaining > 0 && (
                    <div
                        className={clsx(
                            styles.hLast,
                            first === 0 && second === 0 && styles.hLeftEdge,
                            remaining > 0 && styles.hRightEdge
                        )}
                        title={remainingLabel}
                    >
                        <div
                            className={clsx(
                                styles.hContent,
                                belowTitleCutoff(remainingPercentage) &&
                                    styles.hContentNoTitle
                            )}
                        >
                            <span className={styles.hTitle}>
                                {remainingLabel}
                            </span>
                            <span className={styles.hValue}>
                                {displayValue(remainingPercentage)}%
                            </span>
                        </div>
                    </div>
                )}
            </header>
            <Controller
                name={fieldNames.first}
                control={control}
                render={({ onChange, value, onBlur }, { invalid }) => (
                    <RewardDistributionField
                        value={value}
                        onBlur={handleBlur(fieldNames.first, onChange, onBlur)}
                        className={styles.first}
                        label={firstLabel}
                        isInvalid={invalid}
                    />
                )}
            />
            <div className={styles.divider1} />
            <Controller
                name={fieldNames.second}
                control={control}
                render={({ onChange, value, onBlur }, { invalid }) => (
                    <RewardDistributionField
                        value={value}
                        onBlur={handleBlur(fieldNames.second, onChange, onBlur)}
                        className={styles.middle}
                        label={secondLabel}
                        isInvalid={invalid}
                    />
                )}
            />
            <div className={styles.divider2} />
            <RewardDistributionField
                className={styles.last}
                value={remaining}
                label={remainingLabel}
                disabled
            />
        </div>
    );
}
