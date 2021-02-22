import clsx from 'clsx';
import React, { ButtonHTMLAttributes, PropsWithChildren } from 'react';

import styles from './PageHeader.module.scss';

export interface PageHeaderButtonProps
    extends Pick<
        ButtonHTMLAttributes<HTMLButtonElement>,
        'onClick' | 'className'
    > {
    align: 'left' | 'right';
}

export default function PageHeaderButton({
    children,
    className,
    align,
    ...buttonProps
}: PropsWithChildren<PageHeaderButtonProps>): JSX.Element {
    return (
        <button
            type="button"
            className={clsx(styles.button, className)}
            {...buttonProps}
        >
            {children}
        </button>
    );
}
