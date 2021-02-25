import clsx from 'clsx';
import React, { PropsWithChildren } from 'react';

import styles from './PageContainer.module.scss';

interface PageContainerProps {
    boxed?: boolean;
}

export default function PageContainer({
    children,
    boxed = false,
}: PropsWithChildren<PageContainerProps>): JSX.Element {
    return (
        <section className={clsx(styles.root, boxed && styles.rootBoxed)}>
            {boxed ? <div className={styles.box}>{children}</div> : children}
        </section>
    );
}
