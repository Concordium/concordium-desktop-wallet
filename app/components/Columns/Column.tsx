import clsx from 'clsx';
import React, { HTMLAttributes, PropsWithChildren } from 'react';

import styles from './Columns.module.scss';

export interface ColumnProps
    extends Pick<HTMLAttributes<HTMLDivElement>, 'className'> {
    noResize?: boolean;
}

/**
 * @description
 * Used inside \<Columns /\>, and is namespaced as sub-component for that reason.
 *
 * @example
 * <Columns>
 *   <Columns.Column />
 *   <Columns.Column />
 * </Columns>
 */
export default function Column({
    className,
    children,
    noResize = false,
    ...props
}: PropsWithChildren<ColumnProps>): JSX.Element {
    return (
        <div
            className={clsx(
                styles.column,
                noResize && styles.columnNoResize,
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
