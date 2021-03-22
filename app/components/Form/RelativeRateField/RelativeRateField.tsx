import clsx from 'clsx';
import React, { InputHTMLAttributes, useEffect, useState } from 'react';
import { ExchangeRate } from '~/utils/types';
import { CommonInputProps } from '../common';
import ErrorMessage from '../ErrorMessage';

import styles from './RelativeRateField.module.scss';

type InputFieldProps = Pick<
    InputHTMLAttributes<HTMLInputElement>,
    'name' | 'disabled' | 'className'
>;

const bigIntToString = (v?: bigint) => `${v || ''}`;

export interface RelativeRateFieldProps
    extends CommonInputProps,
        InputFieldProps {
    /**
     * Unit of denominator
     */
    denominatorUnit: string;
    /**
     * Unit of value in the field.
     */
    unit: string;
    value: Partial<ExchangeRate>;
    onChange(v: Partial<ExchangeRate>): void;
    onBlur(): void;
}

/**
 * @description
 * Used to for number values of a unit relative to a value of another unit.
 *
 * @example
 * <RelativeRateField value={value} onChange={(e) => setValue(e.target.value)} unit="€" relativeTo="1 NRG" />
 */
function RelativeRateField({
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
    const [innerValue, setInnerValue] = useState<string>(
        bigIntToString(value.numerator)
    );

    let invalid = isInvalid;
    let errorMessage = error;
    let parsedValue: bigint | undefined;

    try {
        parsedValue = BigInt(innerValue);
    } catch {
        invalid = true;
        errorMessage = 'Value must be a valid number';
    }

    useEffect(
        () =>
            onChange({
                denominator: value.denominator,
                numerator: parsedValue,
            }),
        [parsedValue, value.denominator, onChange]
    );

    useEffect(() => setInnerValue(bigIntToString(value.numerator)), [
        value.numerator,
    ]);

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
                    <div className={styles.relativeTo}>
                        {`${denominatorUnit} ${value.denominator}`}
                    </div>
                    <div>&nbsp;=&nbsp;</div>
                    <div className={styles.fieldWrapper}>
                        <div className={styles.unit}>{unit}&nbsp;</div>
                        <input
                            type="number"
                            className={styles.field}
                            disabled={disabled}
                            onChange={(e) => setInnerValue(e.target.value)}
                            value={innerValue}
                            {...props}
                        />
                    </div>
                </div>
                <ErrorMessage>{errorMessage}</ErrorMessage>
            </label>
        </div>
    );
}

export default RelativeRateField;
