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

interface RewardDistributionProps {
    labels: [string, string, string];
    value: RewardDistributionValue;
    onChange(v: RewardDistributionValue): void;
}

export default function RewardDistribution({
    labels,
    value: fieldValue,
    onChange: fieldOnChange,
}: RewardDistributionProps): JSX.Element {
    const formattedValue = formatInputValue(fieldValue);

    const form = useForm<RewardDistributionValue>({
        defaultValues: formattedValue,
    });
    const { first, second } = formattedValue;
    const { watch, control, setValue } = form;
    const innerValues = watch();
    const remaining = 100000 - (first + second);

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
                    >
                        <div
                            className={clsx(
                                styles.hContent,
                                belowTitleCutoff(firstPercentage) &&
                                    styles.hContentNoTitle
                            )}
                        >
                            <span className={styles.hTitle}>{labels[0]}</span>
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
                >
                    <div
                        className={clsx(
                            styles.hContent,
                            belowTitleCutoff(secondPercentage) &&
                                styles.hContentNoTitle
                        )}
                    >
                        <span className={styles.hTitle}>{labels[1]}</span>
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
                    >
                        <div
                            className={clsx(
                                styles.hContent,
                                belowTitleCutoff(remainingPercentage) &&
                                    styles.hContentNoTitle
                            )}
                        >
                            <span className={styles.hTitle}>{labels[2]}</span>
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
                        label={labels[0]}
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
                        label={labels[1]}
                        isInvalid={invalid}
                    />
                )}
            />
            <div className={styles.divider2} />
            <RewardDistributionField
                className={styles.last}
                value={remaining}
                label={labels[2]}
                disabled
            />
        </div>
    );
}
