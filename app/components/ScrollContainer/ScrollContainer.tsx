import clsx from 'clsx';
import React, { PropsWithChildren } from 'react';
import { ClassName } from '~/utils/types';

import styles from './ScrollContainer.module.scss';

type ScrollContainerProps = ClassName &
    PropsWithChildren<{
        /**
         * Defaults to y.
         */
        direction?: 'y' | 'x' | 'both';
    }>;

/**
 * @description
 * Exists to inset vertical scroll bar.
 */
export default function ScrollContainer({
    direction = 'y',
    className,
    children,
}: ScrollContainerProps): JSX.Element {
    return (
        <div
            className={clsx(
                (direction === 'x' || direction === 'both') && styles.x,
                (direction === 'y' || direction === 'both') && styles.y,
                className
            )}
        >
            {children}
        </div>
    );
}
