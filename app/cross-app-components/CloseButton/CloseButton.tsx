import clsx from 'clsx';
import React, { ButtonHTMLAttributes } from 'react';

import CloseIcon from '../../../resources/svg/cross.svg';
import styles from './CloseButton.module.scss';

type CloseButtonProps = Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    'title' | 'type'
>;

export default function CloseButton({
    className,
    ...props
}: CloseButtonProps): JSX.Element {
    return (
        <button
            type="button"
            title="close"
            className={clsx(styles.root, className)}
            {...props}
        >
            <CloseIcon height="20" />
        </button>
    );
}
