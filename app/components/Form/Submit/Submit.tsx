import clsx from 'clsx';
import React, { ComponentProps } from 'react';

import Button from '../../../cross-app-components/Button';

import styles from './Submit.module.scss';

/**
 * @description
 * Use as a regular \<button type="submit" /\>
 */
export default function Submit({
    className,
    ...props
}: Omit<ComponentProps<typeof Button>, 'type'>): ReturnType<typeof Button> {
    return (
        <Button
            className={clsx(styles.root, className)}
            {...props}
            type="submit"
        />
    );
}
