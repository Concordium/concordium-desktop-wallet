import clsx from 'clsx';
import React, { ButtonHTMLAttributes, PropsWithChildren } from 'react';

import styles from './Button.module.scss';

type ButtonSize = 'small' | 'regular' | 'big' | 'huge';

const sizeStyleMap: Record<ButtonSize, string | undefined> = {
    small: styles.rootSmall,
    regular: undefined,
    big: styles.rootBig,
    huge: styles.rootHuge,
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    size?: ButtonSize;
    inverted?: boolean;
    clear?: boolean;
    danger?: boolean;
    icon?: JSX.Element;
    active?: boolean;
}

/**
 * @description
 * Use as a regular \<button /\>.
 */
export default function Button({
    size = 'regular',
    type = 'button',
    inverted = false,
    clear = false,
    danger = false,
    icon,
    active = false,
    className,
    children,
    ...buttonProps
}: PropsWithChildren<ButtonProps>): JSX.Element {
    return (
        <button
            // eslint-disable-next-line react/button-has-type
            type={type}
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
            {...buttonProps}
        >
            {icon && <span className={styles.icon}>{icon}</span>}
            {children}
        </button>
    );
}
