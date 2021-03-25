import React, { useCallback, useEffect } from 'react';

import { Controller, useForm } from 'react-hook-form';
import clsx from 'clsx';

import { EqualRecord, RewardFraction } from '~/utils/types';
import {
    fractionResolution,
    fractionResolutionToPercentage,
} from '~/utils/rewardFractionHelpers';
import { connectWithFormControlled } from '~/components/Form/common/connectWithForm';
import { CommonFieldProps } from '~/components/Form/common';
import useMultiFieldFocus from '~/components/Form/common/useMultiFieldFocus';
import ErrorMessage from '~/components/Form/ErrorMessage';

import RewardDistributionField from './RewardDistributionField';
import styles from './RewardDistribution.module.scss';

export interface RewardDistributionValue {
    first: RewardFraction;
    second: RewardFraction;
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

function belowTitleCutoff(width: number): boolean {
    return width < 30;
}
export interface RewardDistributionProps extends CommonFieldProps {
    /**
     * Labels for first, second and remaining reward party respectively.
     */
    labels: [string, string, string];
    /**
     * Value of first and second reward share in fractions of fractionResolution (e.g. 67812)
     */
    value: RewardDistributionValue | undefined;
    /**
     * Change handler. Ouputs reward share of first and second party in fractions of fractionResolution  (e.g. 67812)
     */
    onChange(v: RewardDistributionValue): void;
    onBlur?(): void;
    disabled?: boolean;
}

/**
 * @description
 * Component for handling reward ratio of 2 parties, with the remainder implicitly going to a third party. Works with whole numbers representing fractions of fractionResolution.
 *
 * @example
 * const [value, setValue] = useState<RewardDistributionValue>({ first: 32145, second: 50400 });
 *
 * <RewardDistribution value={value} onChange={setValue} labels={['first', 'second', 'remaining']} />
 */
export function RewardDistribution({
    labels,
    value: outerValue = { first: 0, second: 0 },
    onChange: fieldOnChange,
    onBlur: fieldOnBlur,
    isInvalid,
    error,
    disabled = false,
}: RewardDistributionProps): JSX.Element {
    const form = useForm<RewardDistributionValue>({
        defaultValues: outerValue,
    });
    const { isFocused, setIsFocused } = useMultiFieldFocus(fieldOnBlur);
    const { first: firstValue, second: secondValue } = outerValue;
    const remainingValue = fractionResolution - (firstValue + secondValue);

    const { watch, control, setValue } = form;
    const innerValues = watch();

    const firstLabel = labels[0];
    const secondLabel = labels[1];
    const remainingLabel = labels[2];

    const firstPercentage = fractionResolutionToPercentage(firstValue);
    const secondPercentage = fractionResolutionToPercentage(secondValue);
    const remainingPercentage = fractionResolutionToPercentage(remainingValue);

    const handleChange = useCallback(
        (
            name: keyof RewardDistributionValue,
            changeHandler: (v: number) => void
        ) => (v: number) => {
            changeHandler(v);

            const other = name === 'first' ? secondValue : firstValue;

            let first;
            let second;
            if (v + other <= fractionResolution) {
                first = name === 'first' ? v : innerValues.first;
                second = name === 'second' ? v : innerValues.second;
            } else {
                first = name === 'first' ? v : fractionResolution - v;
                second = name === 'second' ? v : fractionResolution - v;
            }

            fieldOnChange({ first, second });
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [JSON.stringify(innerValues), fieldOnChange]
    );

    const handleBlur = useCallback(
        (blurHandler: () => void) => () => {
            blurHandler();
            setIsFocused(false);
        },
        [setIsFocused]
    );

    useEffect(() => {
        setValue(fieldNames.first, firstValue);
        setValue(fieldNames.second, secondValue);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [firstValue, secondValue]);

    return (
        <div className={styles.wrapper}>
            <div
                className={clsx(
                    styles.root,
                    isFocused && styles.rootFocused,
                    isInvalid && styles.rootInvalid
                )}
            >
                <header className={styles.header}>
                    {firstValue > 0 && (
                        <div
                            className={clsx(
                                styles.hFirst,
                                firstValue > 0 && styles.hLeftEdge,
                                secondValue === 0 &&
                                    remainingValue === 0 &&
                                    styles.hRightEdge
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
                                <span className={styles.hTitle}>
                                    {firstLabel}
                                </span>
                                <span className={styles.hValue}>
                                    {displayValue(firstPercentage)}%
                                </span>
                            </div>
                        </div>
                    )}
                    <div
                        className={clsx(
                            styles.hMiddle,
                            secondValue === 0 && styles.hMiddleNoValue,
                            firstValue === fractionResolution ||
                                (remainingValue === fractionResolution &&
                                    styles.hMiddleHidden),
                            secondValue > 0 &&
                                firstValue === 0 &&
                                styles.hLeftEdge,
                            secondValue > 0 &&
                                remainingValue === 0 &&
                                styles.hRightEdge
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
                    {remainingValue > 0 && (
                        <div
                            className={clsx(
                                styles.hLast,
                                firstValue === 0 &&
                                    secondValue === 0 &&
                                    styles.hLeftEdge,
                                remainingValue > 0 && styles.hRightEdge
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
                            onBlur={handleBlur(onBlur)}
                            onChange={handleChange(fieldNames.first, onChange)}
                            className={styles.first}
                            label={firstLabel}
                            isInvalid={invalid}
                            onFocus={() => setIsFocused(true)}
                            disabled={disabled}
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
                            onBlur={handleBlur(onBlur)}
                            onChange={handleChange(fieldNames.second, onChange)}
                            className={styles.middle}
                            label={secondLabel}
                            isInvalid={invalid}
                            onFocus={() => setIsFocused(true)}
                            disabled={disabled}
                        />
                    )}
                />
                <div className={styles.divider2} />
                <RewardDistributionField
                    className={styles.last}
                    value={remainingValue}
                    label={remainingLabel}
                    disabled
                />
            </div>
            <ErrorMessage>{error}</ErrorMessage>
        </div>
    );
}

export const FormRewardDistribution = connectWithFormControlled<
    RewardDistributionValue,
    RewardDistributionProps
>(RewardDistribution);
