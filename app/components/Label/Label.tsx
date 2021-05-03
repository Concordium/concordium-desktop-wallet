import React, { PropsWithChildren } from 'react';
import clsx from 'clsx';
import { ClassName } from '~/utils/types';
import styles from './Label.module.scss';

export default function Label({
    children,
    className,
}: PropsWithChildren<ClassName>): JSX.Element {
    return <div className={clsx(styles.root, className)}>{children}</div>;
}
