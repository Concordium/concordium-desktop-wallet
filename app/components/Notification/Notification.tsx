import clsx from 'clsx';
import React, { PropsWithChildren } from 'react';
import CloseIcon from '@resources/svg/cross.svg';
import Button from '~/cross-app-components/Button';
import { NotificationLevel } from '~/features/NotificationSlice';

import styles from './Notification.module.scss';

type NotificationProps = PropsWithChildren<{
    level: NotificationLevel;
    onCloseClick(): void;
}>;

const modifier: Partial<Record<NotificationLevel, string>> = {
    [NotificationLevel.Error]: styles.error,
};

export default function Notification({
    children,
    level,
    onCloseClick,
}: NotificationProps) {
    return (
        <div className={clsx(styles.root, modifier[level])}>
            <Button clear className={styles.close} onClick={onCloseClick}>
                <CloseIcon width="11" />
            </Button>
            {children}
        </div>
    );
}
