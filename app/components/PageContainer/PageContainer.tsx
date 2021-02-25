import clsx from 'clsx';
import React, { PropsWithChildren } from 'react';

import styles from './PageContainer.module.scss';

export interface PageContainerProps {
    boxed?: boolean;
    className?: string;
}

export default function PageContainer({
    children,
    boxed = false,
    className,
}: PropsWithChildren<PageContainerProps>): JSX.Element {
    return (
        <section
            className={clsx(styles.root, boxed && styles.rootBoxed, className)}
        >
            {boxed ? <div className={styles.box}>{children}</div> : children}
        </section>
    );
}
