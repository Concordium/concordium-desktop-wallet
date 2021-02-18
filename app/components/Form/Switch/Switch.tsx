import clsx from 'clsx';
import React, {
    forwardRef,
    InputHTMLAttributes,
    PropsWithChildren,
} from 'react';
import { CommonFieldProps } from '../common';

import styles from './Switch.module.scss';

type SwitchProps = CommonFieldProps & InputHTMLAttributes<HTMLInputElement>;

const Switch = forwardRef<HTMLInputElement, PropsWithChildren<SwitchProps>>(
    ({ children, className, error, ...inputProps }, ref) => {
        return (
            <div
                className={clsx(
                    styles.root,
                    error !== undefined && styles.rootInvalid,
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
