import React, { PropsWithChildren } from 'react';

import styles from './PageHeader.module.scss';

export interface PageHeaderButtonProps {
    align: 'left' | 'right';
}

export default function PageHeaderButton({
    children,
}: PropsWithChildren<PageHeaderButtonProps>): JSX.Element {
    return (
        <button type="button" className={styles.button}>
            {children}
        </button>
    );
}
