import clsx from 'clsx';
import React, { PropsWithChildren } from 'react';

import styles from './PageContainer.module.scss';

export interface PageContainerProps {
    className?: string;
}

/**
 * @description
 *
 */
export default function PageContainer({
    children,
    className,
}: PropsWithChildren<PageContainerProps>): JSX.Element {
    return (
        <section className={clsx(styles.root, className)}>{children}</section>
    );
}
