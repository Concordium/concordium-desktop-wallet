import clsx from 'clsx';
import React, { forwardRef, InputHTMLAttributes } from 'react';

import { CommonFieldProps } from '../common';

import styles from './Input.module.scss';

type InputProps = InputHTMLAttributes<HTMLInputElement> & CommonFieldProps;

/**
 * @description
 * Use as a normal <input />. Should NOT be used for checkbox or radio.
 */
const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ error, className, type = 'text', ...props }, ref) => {
        return (
            <input
                className={clsx(
                    styles.field,
                    className,
                    error !== undefined && styles.fieldInvalid
                )}
                type={type}
                ref={ref}
                {...props}
            />
        );
    }
);

Input.displayName = 'Input';

export default Input;
