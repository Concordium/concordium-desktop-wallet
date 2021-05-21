import clsx from 'clsx';
import React, {
    forwardRef,
    InputHTMLAttributes,
    PropsWithChildren,
} from 'react';

import { CommonFieldProps } from '../common';
import Checkmark from '../../../../resources/svg/checkmark-blue.svg';

import styles from './Checkbox.module.scss';
import ErrorMessage from '../ErrorMessage';

export interface CheckboxProps
    extends CommonFieldProps,
        Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
    /**
     * @description
     * size of checkbox (defaults to regular)
     */
    size?: 'regular' | 'large';
}

/**
 * @description
 * Use as a regular \<input type="checkbox" /\>. Add label as children.
 *
 * @example
 * <Checkbox name="checkbox">This is a checkbox</Checkbox>
 */
const Checkbox = forwardRef<HTMLInputElement, PropsWithChildren<CheckboxProps>>(
    (
        {
            children,
            error,
            isInvalid = false,
            className,
            size = 'regular',
            style,
            ...props
        },
        ref
    ) => {
        const { disabled } = props;
        return (
            <div
                className={clsx(
                    styles.root,
                    isInvalid && styles.rootInvalid,
                    disabled && styles.rootDisabled,
                    className
                )}
                style={style}
            >
                <label className={styles.wrapper}>
                    <input type="checkbox" ref={ref} {...props} />
                    <div
                        className={clsx(
                            styles.checkbox,
                            size === 'large' && styles.checkboxLarge
                        )}
                    >
                        <Checkmark />
                    </div>
                    {children}
                </label>
                <ErrorMessage>{error}</ErrorMessage>
            </div>
        );
    }
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;
