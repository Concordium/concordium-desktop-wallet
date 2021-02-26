import React, { PropsWithChildren } from 'react';
import clsx from 'clsx';

import { ClassNameAndStyle } from '../../utils/types';

import styles from './MainLayout.module.scss';

export default function MainLayout({
    children,
    className,
    ...elProps
}: PropsWithChildren<ClassNameAndStyle>): JSX.Element {
    return (
        <main
            id="main-layout"
            className={clsx(styles.root, className)}
            {...elProps}
        >
            {children}
        </main>
    );
}
