import clsx from 'clsx';
import React, {
    forwardRef,
    InputHTMLAttributes,
    PropsWithChildren,
} from 'react';
import { CommonFieldProps } from '../../components/Form/common';

import styles from './Switch.module.scss';

export type SwitchProps = CommonFieldProps &
    InputHTMLAttributes<HTMLInputElement>;

/**
 * @description
 * Works like a regular \<input type="checkbox" /\>. Children supplied are rendered adjacent to the actual switch.
 *
 * @example
 * <Switch value={value} onChange={(e) => setValue(e.target.checked)}>Toggle setting</Switch>
 */
const Switch = forwardRef<HTMLInputElement, PropsWithChildren<SwitchProps>>(
    ({ children, className, error, isInvalid = false, ...inputProps }, ref) => {
        return (
            <div
                className={clsx(
                    styles.root,
                    isInvalid && styles.rootInvalid,
                    className
                )}
            >
                <label className={styles.switch}>
                    <input type="checkbox" ref={ref} {...inputProps} />
                    <div className={styles.track} />
                    <div className={styles.handle} />
                </label>
                {children && <div className={styles.text}>{children}</div>}
            </div>
        );
    }
);

Switch.displayName = 'Switch';

export default Switch;
