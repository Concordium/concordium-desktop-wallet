import clsx from 'clsx';
import React, { InputHTMLAttributes, useCallback, useState } from 'react';
import { CommonInputProps } from '~/components/Form/common';
import ErrorMessage from '~/components/Form/ErrorMessage';

import styles from './RelativeRateField.module.scss';
import { connectWithFormControlled } from '~/components/Form/common/connectWithForm';
import { useUpdateEffect } from '~/utils/hooks';
import InlineNumber from '~/components/Form/InlineNumber';

type InputFieldProps = Pick<
    InputHTMLAttributes<HTMLInputElement>,
    'disabled' | 'className'
>;

type UnitPosition = 'postfix' | 'prefix';

interface RelativeRateFieldUnit {
    value: string;
    position: UnitPosition;
}

const normaliseFactory = (denominator: bigint, normaliseTo?: number) => (
    value?: string
): string | undefined => {
    if (value === undefined) {
        return undefined;
    }

    if (normaliseTo === undefined) {
        return value;
    }

    return `${Number(value) * (normaliseTo / Number(denominator))}`;
};

const undoNormalizeFactory = (denominator: bigint, normalisedFrom?: number) => (
    value?: string
): string | undefined => {
    if (value === undefined) {
        return undefined;
    }

    if (normalisedFrom === undefined) {
        return value;
    }

    return `${parseFloat(value) / (normalisedFrom / Number(denominator))}`;
};

export interface RelativeRateFieldProps
    extends CommonInputProps,
        InputFieldProps {
    denominator: bigint;
    /**
     * Unit of denominator. Position is "prefix" if string value.
     */
    denominatorUnit: RelativeRateFieldUnit;
    /**
     * Unit of value in the field. Position is "prefix" if string value.
     */
    unit: RelativeRateFieldUnit;
    /**
     * Normalises value to fractions of 1 instead of fractions of denominator. Setting this converts bigint props to Number internally, which might not be preferable.
     */
    normaliseTo?: number;
    value: string | undefined;
    onChange(v: string | undefined): void;
    onBlur(): void;
}

/**
 * @description
 * Used to for number values of a unit relative to a value of another unit.
 *
 * @example
 * <RelativeRateField value={value} onChange={(e) => setValue(e.target.value)} unit="€" relativeTo="1 NRG" />
 */
export function RelativeRateField({
    denominator,
    denominatorUnit,
    unit,
    label,
    isInvalid,
    error,
    disabled,
    className,
    value,
    onChange,
    normaliseTo,
    ...props
}: RelativeRateFieldProps) {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const normalise = useCallback(normaliseFactory(denominator, normaliseTo), [
        denominator,
        normaliseTo,
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const undoNormalize = useCallback(
        undoNormalizeFactory(denominator, normaliseTo),
        [denominator, normaliseTo]
    );

    const [innerValue, setInnerValue] = useState<string | undefined>(
        normalise(value)
    );

    useUpdateEffect(() => {
        onChange(undoNormalize(innerValue));
    }, [innerValue, undoNormalize, onChange]);

    useUpdateEffect(() => {
        setInnerValue(normalise(value));
    }, [value]);

    return (
        <div
            className={clsx(
                styles.root,
                disabled && styles.rootDisabled,
                isInvalid && styles.rootInvalid,
                className
            )}
        >
            <label>
                <span className={styles.label}>{label}</span>
                <div className={styles.container}>
                    {denominatorUnit.position === 'prefix' &&
                        denominatorUnit.value}
                    {(normaliseTo ?? denominator).toString()}
                    {denominatorUnit.position === 'postfix' &&
                        denominatorUnit.value}{' '}
                    ={' '}
                    {unit.position === 'prefix' && (
                        <span className={styles.unit}>{unit.value}</span>
                    )}
                    <InlineNumber
                        className={styles.field}
                        fallbackValue={0}
                        value={innerValue}
                        onChange={setInnerValue}
                        disabled={disabled}
                        allowFractions={normaliseTo !== undefined}
                        {...props}
                    />
                    {unit.position === 'postfix' && (
                        <span className={styles.unit}>{unit.value}</span>
                    )}
                </div>
                <ErrorMessage>{error}</ErrorMessage>
            </label>
        </div>
    );
}

export const FormRelativeRateField = connectWithFormControlled(
    RelativeRateField
);
