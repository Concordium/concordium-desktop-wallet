import clsx from 'clsx';
import React, { InputHTMLAttributes } from 'react';
import { CommonInputProps } from '~/components/Form/common';
import ErrorMessage from '~/components/Form/ErrorMessage';

import styles from './RelativeRateField.module.scss';
import { connectWithFormControlled } from '~/components/Form/common/connectWithForm';
import InlineNumber from '~/components/Form/InlineNumber';
import { noOp } from '~/utils/basicHelpers';
import { InlineNumberProps } from '~/components/Form/InlineNumber/InlineNumber';

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
        Pick<InlineNumberProps, 'allowFractions' | 'ensureDigits'>,
        InputFieldProps {
    denominator: string;
    /**
     * Unit of denominator. Position is "prefix" if string value.
     */
    denominatorUnit: RelativeRateFieldUnit;
    /**
     * Unit of value in the field. Position is "prefix" if string value.
     */
    unit: RelativeRateFieldUnit;
    value: string | undefined;
    onChange?(v: string | undefined): void;
    onBlur?(): void;
}

/**
 * @description
 * Used to represent and update values of a unit relative to a value of another unit.
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
    onChange = noOp,
    onBlur = noOp,
    ...props
}: RelativeRateFieldProps) {
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
                    {denominator}
                    {denominatorUnit.position === 'postfix' &&
                        denominatorUnit.value}{' '}
                    ={' '}
                    {unit.position === 'prefix' && (
                        <span className={styles.unit}>{unit.value}</span>
                    )}
                    <InlineNumber
                        className={styles.field}
                        fallbackValue={0}
                        value={value}
                        onChange={onChange}
                        disabled={disabled}
                        onBlur={onBlur}
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
