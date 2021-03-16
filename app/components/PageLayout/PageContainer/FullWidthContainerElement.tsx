import clsx from 'clsx';
import React, { PropsWithChildren } from 'react';
import { ClassName } from '~/utils/types';

import styles from './PageContainer.module.scss';

/**
 * @description
 * Used inside \<PageLayout.Container /\> to subtract the left/right padding of the container, thus making a full width element.
 *
 * @example
 * <PageLayout>
 *   <PageLayout.Container>
 *     <PageLayout.FullWidthContainerElement>
 *       Full width content...
 *     </PageLayout.FullWidthContainerElement>
 *   </PageLayout.Container>
 * </PageLayout>
 */
export default function FullWidthContainerSection({
    children,
    className,
}: PropsWithChildren<ClassName>): JSX.Element {
    return (
        <div className={clsx(styles.subtractPadding, className)}>
            {children}
        </div>
    );
}
