import clsx from 'clsx';
import React, { InputHTMLAttributes } from 'react';
import { CommonInputProps } from '~/components/Form/common';
import ErrorMessage from '~/components/Form/ErrorMessage';

import styles from './RelativeRateField.module.scss';
import { connectWithFormControlled } from '~/components/Form/common/connectWithForm';
import InlineNumber from '~/components/Form/InlineNumber';
import { noOp } from '~/utils/basicHelpers';
import { isValidRelativeRatePart, RelativeRateValue } from './util';

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
    numeratorUnit: RelativeRateFieldUnit;
    value: RelativeRateValue;
    onChange?(v: RelativeRateValue): void;
    onBlur?(): void;
}

/**
 * @description
 * Used to represent and update values of a unit relative to a value of another unit.
 *
 * @example
 * <RelativeRateField value={value} onChange={setValue} numeratorUnit={{ value: '€' }} denominatorUnit={{ value: '€' }} />
 */
export function RelativeRateField({
    denominatorUnit,
    numeratorUnit,
    label,
    isInvalid,
    error,
    disabled,
    className,
    value,
    onChange = noOp,
    onBlur = noOp,
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
                    <InlineNumber
                        className={styles.field}
                        fallbackValue={0}
                        value={value.denominator}
                        onChange={(v) => onChange({ ...value, denominator: v })}
                        disabled={disabled}
                        onBlur={onBlur}
                        isInvalid={!isValidRelativeRatePart(value.denominator)}
                    />
                    {denominatorUnit.position === 'postfix' &&
                        denominatorUnit.value}{' '}
                    ={' '}
                    {numeratorUnit.position === 'prefix' && (
                        <span className={styles.unit}>
                            {numeratorUnit.value}
                        </span>
                    )}
                    <InlineNumber
                        className={styles.field}
                        fallbackValue={0}
                        value={value.numerator}
                        onChange={(v) => onChange({ ...value, numerator: v })}
                        disabled={disabled}
                        onBlur={onBlur}
                        isInvalid={!isValidRelativeRatePart(value.numerator)}
                    />
                    {numeratorUnit.position === 'postfix' && (
                        <span className={styles.unit}>
                            {numeratorUnit.value}
                        </span>
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
