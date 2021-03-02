import clsx from 'clsx';
import React, { ElementType, PropsWithChildren } from 'react';
import { PolymorphicComponentProps } from '../../utils/types';

import styles from './Button.module.scss';

type ButtonSize = 'small' | 'regular' | 'big' | 'huge';

const sizeStyleMap: Record<ButtonSize, string | undefined> = {
    small: styles.rootSmall,
    regular: undefined,
    big: styles.rootBig,
    huge: styles.rootHuge,
};

interface Props {
    size?: ButtonSize;
    inverted?: boolean;
    clear?: boolean;
    danger?: boolean;
    icon?: JSX.Element;
    active?: boolean;
}

export type ButtonProps<
    TAs extends ElementType = 'button'
> = PolymorphicComponentProps<TAs, Props>;

/**
 * @description
 * Use as a regular \<button /\>.
 */
export default function Button<TAs extends ElementType = 'button'>({
    size = 'regular',
    inverted = false,
    clear = false,
    danger = false,
    icon,
    active = false,
    className,
    as,
    children,
    ...props
}: PropsWithChildren<ButtonProps<TAs>>): JSX.Element {
    const Component = as || 'button';

    return (
        <Component
            type="button"
            className={clsx(
                styles.root,
                size && sizeStyleMap[size],
                inverted && styles.rootInverted,
                clear && styles.rootClear,
                danger && styles.rootDanger,
                icon && styles.rootWithIcon,
                active && styles.rootActive,
                className
            )}
            {...props}
        >
            {icon && <span className={styles.icon}>{icon}</span>}
            {children}
        </Component>
    );
}
