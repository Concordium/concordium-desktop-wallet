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
    ({ children, error, className, size = 'regular', ...props }, ref) => {
        return (
            <div>
                <label
                    className={clsx(
                        styles.root,
                        error !== undefined && styles.rootInvalid,
                        className
                    )}
                >
                    <input type="checkbox" ref={ref} {...props} />
                    <div
                        className={clsx(
                            styles.checkbox,
                            size === 'large' && styles.checkboxLarge
                        )}
                    >
                        <Checkmark />
                    </div>
                    {children && <div className={styles.text}>{children}</div>}
                </label>
                <ErrorMessage>{error}</ErrorMessage>
            </div>
        );
    }
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;
