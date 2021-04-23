import clsx from 'clsx';
import React, { MouseEvent } from 'react';
import styles from './SidedRow.module.scss';

interface RowProps {
    className?: string;
    left: string | JSX.Element | undefined;
    right: string | JSX.Element | undefined;
    onClick?(e: MouseEvent): void;
}

export default function SidedRow({
    className,
    left,
    right,
    onClick,
}: RowProps): JSX.Element {
    return (
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
        <div className={clsx(styles.row, className)} onClick={onClick}>
            <div className={styles.left}>{left}</div>
            <div className={styles.right}>{right}</div>
        </div>
    );
}
