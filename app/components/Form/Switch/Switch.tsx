import React, { forwardRef, PropsWithChildren } from 'react';

import styles from './Switch.module.scss';

const Switch = forwardRef<HTMLInputElement, PropsWithChildren<unknown>>(
    ({ children }, ref) => {
        return (
            <div className={styles.root}>
                <label className={styles.switch}>
                    <input type="checkbox" ref={ref} />
                    <div className={styles.track} />
                    <div className={styles.handle} />
                </label>
                <div>{children}</div>
            </div>
        );
    }
);

Switch.displayName = 'Switch';

export default Switch;
