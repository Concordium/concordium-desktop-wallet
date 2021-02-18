import clsx from 'clsx';
import React, {
    forwardRef,
    InputHTMLAttributes,
    PropsWithChildren,
} from 'react';

import { CommonFieldProps } from '../common';

import styles from './Checkbox.module.scss';

interface CheckboxProps
    extends CommonFieldProps,
        InputHTMLAttributes<HTMLInputElement> {
    /**
     * @description
     * className added to the inner checkbox element.
     */
    checkboxClassName?: string;
}

/**
 * @description
 * Use as a regular <input type="checkbox" />. Add label as children.
 *
 * @example
 * <Checkbox name="checkbox">This is a checkbox</Checkbox>
 */
const Checkbox = forwardRef<HTMLInputElement, PropsWithChildren<CheckboxProps>>(
    ({ children, error, className, checkboxClassName, ...props }, ref) => {
        return (
            <label
                className={clsx(
                    styles.root,
                    error !== undefined && styles.rootInvalid,
                    className
                )}
            >
                <input type="checkbox" ref={ref} {...props} />
                <div className={clsx(styles.checkbox, checkboxClassName)} />
                {children && <div className={styles.text}>{children}</div>}
            </label>
        );
    }
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;
