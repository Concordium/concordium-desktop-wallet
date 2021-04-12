import React, { PropsWithChildren } from 'react';

import styles from './ScrollContainer.module.scss';

type ScrollContainerProps = PropsWithChildren<unknown>;

/**
 * @description
 * Exists to inset vertical scroll bar.
 */
export default function ScrollContainer({
    children,
}: ScrollContainerProps): JSX.Element {
    return (
        <div className={styles.root}>
            <div className={styles.content}>{children}</div>
        </div>
    );
}
