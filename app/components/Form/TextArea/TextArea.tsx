import clsx from 'clsx';
import React, { forwardRef, TextareaHTMLAttributes } from 'react';

import { FieldCommonProps } from '../common';

import styles from './TextArea.module.scss';

export type TextAreaProps = Omit<
    TextareaHTMLAttributes<HTMLTextAreaElement>,
    'name'
> &
    FieldCommonProps;

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
    ({ error, className, ...props }, ref) => {
        return (
            <textarea
                className={clsx(
                    styles.field,
                    className,
                    error && styles.fieldInvalid
                )}
                ref={ref}
                {...props}
            />
        );
    }
);

TextArea.displayName = 'TextArea';

export default TextArea;
