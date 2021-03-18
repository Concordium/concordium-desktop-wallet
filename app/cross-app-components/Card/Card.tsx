import clsx from 'clsx';
import React, { PropsWithChildren } from 'react';

import styles from './Card.module.scss';

export interface CardProps {
    className?: string;
}

function Card({
    children,
    className,
}: PropsWithChildren<CardProps>): JSX.Element {
    return <div className={clsx(styles.root, className)}>{children}</div>;
}

export default Card;
