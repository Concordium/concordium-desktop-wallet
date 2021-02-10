import React, { PropsWithChildren } from 'react';

import styles from './MainLayout.module.scss';

export default function MainLayout({
    children,
}: PropsWithChildren<unknown>): JSX.Element {
    return <main className={styles.root}>{children}</main>;
}
