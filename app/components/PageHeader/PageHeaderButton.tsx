import React, { PropsWithChildren } from 'react';

import styles from './PageHeader.module.scss';

export default function PageHeaderButton({
    children,
}: PropsWithChildren<unknown>): JSX.Element {
    return (
        <button type="button" className={styles.button}>
            {children}
        </button>
    );
}
