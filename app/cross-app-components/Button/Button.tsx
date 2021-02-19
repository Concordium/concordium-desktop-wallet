import clsx from 'clsx';
import React, { ButtonHTMLAttributes, PropsWithChildren } from 'react';

import styles from './Button.module.scss';

enum ButtonSize {
    SMALL = 'small',
    REGULAR = 'regular',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    size?: ButtonSize;
}

const sizeStyleMap: Record<ButtonSize, string | undefined> = {
    small: styles.rootSmall,
    regular: undefined,
};

export default function Button({
    size = ButtonSize.REGULAR,
    type = 'button',
    className,
    ...buttonProps
}: PropsWithChildren<ButtonProps>): JSX.Element {
    return (
        <button
            // eslint-disable-next-line react/button-has-type
            type={type}
            className={clsx(styles.root, size && sizeStyleMap[size])}
            {...buttonProps}
        />
    );
}
