import React, { useCallback, useEffect } from 'react';

import { Controller, useForm } from 'react-hook-form';
import clsx from 'clsx';
import RewardDistributionField from './RewardDistributionField';
import styles from './RewardDistribution.module.scss';
import { EqualRecord } from '../../../utils/types';

export interface RewardDistributionValue {
    first: number;
    second: number;
}

const fieldNames: EqualRecord<RewardDistributionValue> = {
    first: 'first',
    second: 'second',
};

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
    const form = useForm<RewardDistributionValue>({
        defaultValues: fieldValue,
    });
    const { first, second } = fieldValue;
    const { watch, control, setValue } = form;
    const innerValues = watch();
    const remaining = 100 - (first + second);

    const handleBlur = useCallback(
        (
            name: keyof RewardDistributionValue,
            fieldChangeHandler: (v: number) => void,
            fieldBlurHandler: () => void
        ) => (v: number) => {
            fieldChangeHandler(v);
            fieldBlurHandler();

            const other = name === 'first' ? second : first;

            if (v + other <= 100) {
                fieldOnChange({
                    first: name === 'first' ? v : innerValues.first,
                    second: name === 'second' ? v : innerValues.second,
                });
            } else {
                fieldOnChange({
                    first: name === 'first' ? v : 100 - v,
                    second: name === 'second' ? v : 100 - v,
                });
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [JSON.stringify(innerValues), fieldOnChange]
    );

    useEffect(() => {
        setValue(fieldNames.first, first);
        setValue(fieldNames.second, second);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fieldValue]);

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
                        style={{ width: `${first}%` }}
                    >
                        <div className={styles.hContent}>
                            <span>{labels[0]}</span>
                            <span>{first}%</span>
                        </div>
                    </div>
                )}
                <div
                    className={clsx(
                        styles.hMiddle,
                        second === 0 && styles.hMiddleNoValue,
                        first === 100 ||
                            (remaining === 100 && styles.hMiddleHidden),
                        second > 0 && first === 0 && styles.hLeftEdge,
                        second > 0 && remaining === 0 && styles.hRightEdge
                    )}
                    style={{ width: `${second}%` }}
                >
                    <div className={styles.hContent}>
                        <span>{labels[0]}</span>
                        <span>{second}%</span>
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
                        <div className={styles.hContent}>{remaining}%</div>
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
                        label={labels[0]}
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
