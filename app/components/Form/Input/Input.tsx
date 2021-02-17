import React, { forwardRef, InputHTMLAttributes } from 'react';
import { FieldCommonProps } from '../common';

export type InputProps = InputHTMLAttributes<HTMLInputElement> &
    FieldCommonProps;

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ error, ...props }, ref) => {
        return <input {...props} ref={ref} />;
    }
);

Input.displayName = 'Input';

export default Input;
