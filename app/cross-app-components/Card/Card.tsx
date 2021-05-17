import clsx from 'clsx';
import React, { HTMLAttributes, PropsWithChildren } from 'react';

import styles from './Card.module.scss';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
    className?: string;
    header?: string | JSX.Element;
}

function Card({
    children,
    className,
    header,
    ...props
}: PropsWithChildren<CardProps>): JSX.Element {
    return (
        <div className={clsx(styles.root, className)} {...props}>
            {header && <h2 className={styles.header}>{header}</h2>}
            {children}
        </div>
    );
}

export default Card;
