import clsx from 'clsx';
import React, { PropsWithChildren } from 'react';

import styles from './PageContainer.module.scss';

export interface PageContainerProps {
    className?: string;
}

/**
 * @description
 * Used in <PageLayout /> to wrap content in a container with background.
 *
 * @example
 * <PageLayout>
 *   <PageLayout.Container>
 *     Content...
 *   </PageLayout.Container>
 * </PageLayout>
 */
export default function PageContainer({
    children,
    className,
}: PropsWithChildren<PageContainerProps>): JSX.Element {
    return (
        <section className={clsx(styles.root, className)}>{children}</section>
    );
}
