import React, { PropsWithChildren } from 'react';
import clsx from 'clsx';
import { ClassName } from '~/utils/types';
import styles from './CardList.module.scss';

/**
 * Used for a list of <Card /> elements, to generate a consistently looking layout.
 */
export default function CardList({
    children,
    className,
}: PropsWithChildren<ClassName>): JSX.Element {
    return <div className={clsx(styles.root, className)}>{children}</div>;
}
