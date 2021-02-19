import clsx from 'clsx';
import React, { ButtonHTMLAttributes, PropsWithChildren } from 'react';

import styles from './Button.module.scss';

type ButtonSize = 'small' | 'regular' | 'big';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    size?: ButtonSize;
    inverted?: boolean;
}

const sizeStyleMap: Record<ButtonSize, string | undefined> = {
    small: styles.rootSmall,
    regular: undefined,
    big: styles.rootBig,
};

/**
 * @description
 * Use as a regular \<button /\>.
 */
export default function Button({
    size = 'regular',
    type = 'button',
    inverted = false,
    className,
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
                className
            )}
            {...buttonProps}
        />
    );
}
