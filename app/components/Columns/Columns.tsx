import clsx from 'clsx';
import React, {
    Children,
    cloneElement,
    FC,
    Fragment,
    ReactElement,
    useCallback,
    useMemo,
} from 'react';
import Column, { ColumnProps } from './Column';

import styles from './Columns.module.scss';

export interface ColumnsProps {
    /**
     * Controls whether or not a divider is visible between columns.
     */
    divider?: boolean;
    /**
     * Must be of type <Columns.Column />
     */
    children: ReactElement<ColumnProps>[];
    className?: string;
    /**
     * Used to override column styling
     */
    columnClassName?: string;
    /**
     * Columns scroll individually if true. Defaults to false.
     */
    columnScroll?: boolean;
    /**
     * Assumes variable size of columns if true. Defaults to false.
     */
    variableSize?: boolean;
}

/**
 * @description
 * Used to render content in a column layout.
 *
 * @example
 * <Columns columnClassName={styles.columnOverride} divider>
 *   <Columns.Column>First column</Columns.Column>
 *   <Columns.Column>Second column</Columns.Column>
 * </Columns>
 */
function Columns({
    children,
    divider = false,
    columnScroll = false,
    className,
    columnClassName,
    variableSize = false,
}: ColumnsProps): JSX.Element {
    const getColProps = useCallback(
        (col: ReactElement<ColumnProps>) => ({
            ...col.props,
            className: clsx(columnClassName, col.props.className),
        }),
        [columnClassName]
    );

    const enrichedChildren = useMemo(
        () => Children.map(children, (c) => cloneElement(c, getColProps(c))),
        [children, getColProps]
    );

    return (
        <div
            className={clsx(
                styles.root,
                columnScroll && styles.rootColumnScroll,
                variableSize && styles.rootVariableSize,
                className
            )}
        >
            {divider
                ? enrichedChildren.map((c, i) => (
                      // eslint-disable-next-line react/no-array-index-key
                      <Fragment key={i}>
                          {c}
                          {i < enrichedChildren.length - 1 && (
                              <div className={styles.divider} />
                          )}
                      </Fragment>
                  ))
                : enrichedChildren}
        </div>
    );
}

Columns.Column = Column;
(Columns.Column as FC).displayName = 'Columns.Column';

export default Columns;
