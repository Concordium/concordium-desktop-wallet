import clsx from 'clsx';
import React, { forwardRef, InputHTMLAttributes } from 'react';

import { CommonFieldProps } from '../common';

import styles from './Input.module.scss';

type InputProps = InputHTMLAttributes<HTMLInputElement> & CommonFieldProps;

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ error, className, ...props }, ref) => {
        return (
            <input
                className={clsx(
                    styles.field,
                    className,
                    error !== undefined && styles.fieldInvalid
                )}
                ref={ref}
                {...props}
            />
        );
    }
);

Input.displayName = 'Input';

export default Input;
