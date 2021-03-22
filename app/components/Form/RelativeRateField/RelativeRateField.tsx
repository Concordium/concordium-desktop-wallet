import clsx from 'clsx';
import React, { forwardRef, InputHTMLAttributes } from 'react';
import { CommonInputProps } from '../common';
import ErrorMessage from '../ErrorMessage';

import styles from './RelativeRateField.module.scss';

type InputFieldProps = Pick<
    InputHTMLAttributes<HTMLInputElement>,
    | 'name'
    | 'value'
    | 'onChange'
    | 'onBlur'
    | 'disabled'
    | 'className'
    | 'defaultValue'
>;

export interface RelativeFieldProps extends CommonInputProps, InputFieldProps {
    /**
     * Text showed on left side of field.
     */
    relativeTo: string;
    /**
     * Unit of value in the field.
     */
    unit: string;
}

/**
 * @description
 * Used to for number values of a unit relative to a value of another unit.
 *
 * @example
 * <RelativeRateField value={value} onChange={(e) => setValue(e.target.value)} unit="€" relativeTo="1 NRG" />
 */
const RelativeRateField = forwardRef<HTMLInputElement, RelativeFieldProps>(
    (
        {
            relativeTo,
            unit,
            label,
            isInvalid,
            error,
            disabled,
            className,
            ...props
        },
        ref
    ) => {
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
                        <div className={styles.relativeTo}>{relativeTo}</div>
                        <div>&nbsp;=&nbsp;</div>
                        <div className={styles.fieldWrapper}>
                            <div className={styles.unit}>{unit}</div>
                            <input
                                ref={ref}
                                type="number"
                                className={styles.field}
                                disabled={disabled}
                                {...props}
                            />
                        </div>
                    </div>
                    <ErrorMessage>{error}</ErrorMessage>
                </label>
            </div>
        );
    }
);

RelativeRateField.displayName = 'RelativeRateField';

export default RelativeRateField;
