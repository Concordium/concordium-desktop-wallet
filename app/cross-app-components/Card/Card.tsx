import clsx from 'clsx';
import React, { HTMLAttributes, PropsWithChildren } from 'react';

import styles from './Card.module.scss';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
    className?: string;
}

function Card({
    children,
    className,
    ...props
}: PropsWithChildren<CardProps>): JSX.Element {
    return (
        <div className={clsx(styles.root, className)} {...props}>
            {children}
        </div>
    );
}

export default Card;
