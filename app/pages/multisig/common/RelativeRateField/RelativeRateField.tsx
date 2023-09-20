/* eslint-disable jsx-a11y/label-has-associated-control */
import clsx from 'clsx';
import React, { InputHTMLAttributes, PropsWithChildren, useMemo } from 'react';
import { CommonInputProps } from '~/components/Form/common';
import ErrorMessage from '~/components/Form/ErrorMessage';

import styles from './RelativeRateField.module.scss';
import { connectWithFormControlled } from '~/components/Form/common/connectWithForm';
import InlineNumber from '~/components/Form/InlineNumber';
import { noOp } from '~/utils/basicHelpers';
import {
    fromExchangeRate,
    isValidRelativeRatePart,
    RelativeRateValue,
} from './util';
import { getReducedExchangeRate } from '~/utils/exchangeRateHelpers';

type InputFieldProps = Pick<
    InputHTMLAttributes<HTMLInputElement>,
    'disabled' | 'className'
>;

type UnitPosition = 'postfix' | 'prefix';

interface RelativeRateFieldUnit {
    value: string;
    position: UnitPosition;
}

function UnitContext({
    children,
    position,
    value,
}: PropsWithChildren<RelativeRateFieldUnit>): JSX.Element {
    return (
        <>
            {position === 'prefix' && value}
            {children}
            {position === 'postfix' && value}
        </>
    );
}

export interface RelativeRateFieldProps
    extends CommonInputProps,
        InputFieldProps {
    /**
     * Symbol that splits the values. Defaults to "="
     */
    splitSymbol?: string;
    /**
     * Unit of denominator. Position is "prefix" if string value.
     */
    denominatorUnit?: RelativeRateFieldUnit;
    /**
     * Unit of value in the field. Position is "prefix" if string value.
     */
    numeratorUnit?: RelativeRateFieldUnit;
    value: RelativeRateValue;
    display?: boolean;
    onChange?(v: RelativeRateValue): void;
    onBlur?(): void;
}

const emptyUnit: RelativeRateFieldUnit = { value: '', position: 'prefix' };

/**
 * @description
 * Used to represent and update values of a unit relative to a value of another unit.
 *
 * @example
 * <RelativeRateField value={value} onChange={setValue} numeratorUnit={{ value: '€' }} denominatorUnit={{ value: '€' }} />
 */
export function RelativeRateField({
    denominatorUnit = emptyUnit,
    numeratorUnit = emptyUnit,
    splitSymbol = '=',
    label,
    isInvalid,
    error,
    className,
    value,
    display = false,
    disabled = display,
    onChange = noOp,
    onBlur = noOp,
}: RelativeRateFieldProps) {
    const reduced = useMemo(() => {
        try {
            const r = fromExchangeRate(
                getReducedExchangeRate({
                    numerator: BigInt(value.numerator),
                    denominator: BigInt(value.denominator),
                })
            );

            const { numerator: rn, denominator: rd } = r;

            if (rn !== value.numerator || rd !== value.denominator) {
                return r;
            }

            return undefined;
        } catch {
            return undefined;
        }
    }, [value.numerator, value.denominator]);

    return (
        <div
            className={clsx(
                styles.root,
                disabled && styles.rootDisabled,
                display && styles.rootDisplay,
                isInvalid && styles.rootInvalid,
                className
            )}
        >
            <label>
                <span className={styles.label}>{label}</span>
                <div className={styles.container}>
                    <label className={styles.fieldWrapper}>
                        <UnitContext {...numeratorUnit}>
                            <InlineNumber
                                className={styles.field}
                                fallbackValue={0}
                                value={value.numerator}
                                onChange={(v) =>
                                    onChange({ ...value, numerator: v })
                                }
                                disabled={disabled}
                                onBlur={onBlur}
                                isInvalid={
                                    !isValidRelativeRatePart(value.numerator)
                                }
                            />
                        </UnitContext>
                    </label>
                    {` ${splitSymbol} `}
                    <label className={styles.fieldWrapper}>
                        <UnitContext {...denominatorUnit}>
                            <InlineNumber
                                className={styles.field}
                                fallbackValue={0}
                                value={value.denominator}
                                onChange={(v) =>
                                    onChange({ ...value, denominator: v })
                                }
                                disabled={disabled}
                                onBlur={onBlur}
                                isInvalid={
                                    !isValidRelativeRatePart(value.denominator)
                                }
                            />
                        </UnitContext>
                    </label>
                </div>
                {reduced && (
                    <div className={styles.reduced}>
                        Reduced to:{' '}
                        <UnitContext {...numeratorUnit}>
                            {reduced.numerator}
                        </UnitContext>
                        {` ${splitSymbol} `}
                        <UnitContext {...denominatorUnit}>
                            {reduced.denominator}
                        </UnitContext>
                    </div>
                )}
                <ErrorMessage>{error}</ErrorMessage>
            </label>
        </div>
    );
}

export const FormRelativeRateField = connectWithFormControlled(
    RelativeRateField
);
