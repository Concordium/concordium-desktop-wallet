import clsx from 'clsx';
import React, { InputHTMLAttributes, useState } from 'react';
import { ExchangeRate } from '~/utils/types';
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

export interface RelativeRateFieldProps
    extends CommonInputProps,
        InputFieldProps {
    /**
     * Unit of denominator. Position is "prefix" if string value.
     */
    denominatorUnit: RelativeRateFieldUnit;
    /**
     * Unit of value in the field. Position is "prefix" if string value.
     */
    unit: RelativeRateFieldUnit;
    value: ExchangeRate | undefined;
    onChange(v: ExchangeRate | undefined): void;
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
    denominatorUnit,
    unit,
    label,
    isInvalid,
    error,
    disabled,
    className,
    value,
    onChange,
    ...props
}: RelativeRateFieldProps) {
    const [innerValue, setInnerValue] = useState<string | undefined>(
        value?.numerator?.toString()
    );
    const denominator = value?.denominator || 1n; // TODO default?

    let invalid = isInvalid;
    let errorMessage = error;
    let parsedValue: bigint | undefined;

    try {
        parsedValue = BigInt(innerValue);
    } catch {
        invalid = true;
        errorMessage = 'Value must be a valid number';
    }

    useUpdateEffect(() => {
        if (parsedValue === undefined) {
            onChange(undefined);
        } else {
            onChange({
                denominator,
                numerator: parsedValue,
            });
        }
    }, [parsedValue, denominator, onChange]);

    useUpdateEffect(() => {
        setInnerValue(value?.numerator?.toString());
    }, [value?.numerator]);

    return (
        <div
            className={clsx(
                styles.root,
                disabled && styles.rootDisabled,
                invalid && styles.rootInvalid,
                className
            )}
        >
            <label>
                <span className={styles.label}>{label}</span>
                <div className={styles.container}>
                    {denominatorUnit.position === 'prefix' &&
                        denominatorUnit.value}
                    {denominator.toString()}
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
                        {...props}
                    />
                    {unit.position === 'postfix' && (
                        <span className={styles.unit}>{unit.value}</span>
                    )}
                </div>
                <ErrorMessage>{errorMessage}</ErrorMessage>
            </label>
        </div>
    );
}

export const FormRelativeRateField = connectWithFormControlled<
    Partial<ExchangeRate>,
    RelativeRateFieldProps
>(RelativeRateField);
