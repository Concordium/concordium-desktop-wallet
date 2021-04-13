import clsx from 'clsx';
import React, { HTMLAttributes, PropsWithChildren } from 'react';

import styles from './Columns.module.scss';

export interface ColumnProps
    extends Pick<HTMLAttributes<HTMLDivElement>, 'className'> {
    /**
     * Column neither shrinks nor grows when set to true. Defaults to false.
     */
    noResize?: boolean;
    header?: string;
    /**
     * Include padding on top/bottom of column
     */
    verticalPadding?: boolean;
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
    verticalPadding = false,
    header,
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
            {header && <h3 className={styles.header}>{header}</h3>}
            <div className={styles.contentWrapper}>
                <div
                    className={clsx(
                        styles.content,
                        verticalPadding && styles.contentVertPadding
                    )}
                >
                    {children}
                </div>
            </div>
        </div>
    );
}
