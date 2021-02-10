import React, { PropsWithChildren } from 'react';

import styles from './PageHeader.module.scss';
import PageHeaderButton from './PageHeaderButton';

export default function PageHeader({
    children,
}: PropsWithChildren<unknown>): JSX.Element {
    return <header className={styles.root}>{children}</header>;
}

PageHeader.Button = PageHeaderButton;
