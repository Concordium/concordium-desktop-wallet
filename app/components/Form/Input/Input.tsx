import clsx from 'clsx';
import React, { forwardRef, InputHTMLAttributes } from 'react';

import { CommonInputProps } from '../common';
import ErrorMessage from '../ErrorMessage';

import styles from './Input.module.scss';

export type InputProps = InputHTMLAttributes<HTMLInputElement> &
    CommonInputProps;

/**
 * @description
 * Use as a normal \<input /\>. Should NOT be used for checkbox or radio.
 */
const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ error, className, type = 'text', label, ...props }, ref) => {
        return (
            <label className={clsx(styles.root, className)}>
                {label}
                <input
                    className={clsx(
                        styles.field,
                        error !== undefined && styles.fieldInvalid
                    )}
                    type={type}
                    ref={ref}
                    {...props}
                />
                <ErrorMessage>{error}</ErrorMessage>
            </label>
        );
    }
);

Input.displayName = 'Input';

export default Input;
