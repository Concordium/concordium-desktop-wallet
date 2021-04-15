import clsx from 'clsx';
import React, { ButtonHTMLAttributes, PropsWithChildren } from 'react';

import Button from '../Button';
import styles from './IconButton.module.scss';

export type IconButtonProps = PropsWithChildren<
    ButtonHTMLAttributes<HTMLButtonElement>
>;

export default function CloseButton({
    className,
    ...props
}: IconButtonProps): JSX.Element {
    return (
        <Button
            type="button"
            clear
            className={clsx(styles.root, className)}
            {...props}
        />
    );
}
