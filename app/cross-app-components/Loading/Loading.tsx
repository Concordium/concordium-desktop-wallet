import React from 'react';
import clsx from 'clsx';

import LoadingIcon from '@resources/svg/logo-pending.svg';
import { ClassName } from '~/utils/types';

import styles from './Loading.module.scss';

export interface LoadingProps extends ClassName {
    // Position inline instead of center of parent element. Defaults to false.
    inline?: boolean;
    text?: string;
}

/**
 * @description
 * Places a loading indicator in the center of the parent element.
 * Centers according to nearest ancestor with css position declared.
 *
 * @example
 * {isLoading && <Loading />}
 */
export default function Loading({
    className,
    inline = false,
    text,
}: LoadingProps): JSX.Element {
    return (
        <span className={clsx(styles.root, inline && styles.inline, className)}>
            <LoadingIcon className={styles.icon} />
            {text && <div className={styles.text}>{text}</div>}
        </span>
    );
}
