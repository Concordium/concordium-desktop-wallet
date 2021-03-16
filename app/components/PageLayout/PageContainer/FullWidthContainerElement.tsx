import clsx from 'clsx';
import React, { PropsWithChildren } from 'react';
import { ClassName } from '~/utils/types';

import styles from './PageContainer.module.scss';

export default function FullWidthContainerElement({
    children,
    className,
}: PropsWithChildren<ClassName>): JSX.Element {
    return (
        <div className={clsx(styles.subtractPadding, className)}>
            {children}
        </div>
    );
}
