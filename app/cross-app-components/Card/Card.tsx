import clsx from 'clsx';
import React, { ElementType, PropsWithChildren } from 'react';
import { PolymorphicComponentProps } from '~/utils/types';

import styles from './Card.module.scss';

export type CardProps<
    TAs extends ElementType = 'div'
> = PolymorphicComponentProps<
    TAs,
    {
        className?: string;
        header?: string | JSX.Element;
        dark?: boolean;
    }
>;

function Card<TAs extends ElementType = 'div'>({
    children,
    className,
    header,
    dark = false,
    as,
    ...props
}: PropsWithChildren<CardProps<TAs>>): JSX.Element {
    const Component = as ?? 'div';
    return (
        <Component
            className={clsx(styles.root, dark && styles.dark, className)}
            {...props}
        >
            {header && <h2 className={styles.header}>{header}</h2>}
            {children}
        </Component>
    );
}

export default Card;
