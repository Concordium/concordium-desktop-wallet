import React, { PropsWithChildren } from 'react';

import styles from './ErrorMessage.module.scss';

export default function ErrorMessage({
    children,
}: PropsWithChildren<unknown>): JSX.Element | null {
    if (!children) {
        return null;
    }

    return <span className={styles.root}>{children}</span>;
}
