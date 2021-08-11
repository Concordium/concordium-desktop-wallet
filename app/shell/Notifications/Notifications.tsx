import React from 'react';
import { useSelector } from 'react-redux';
import Portal from '~/cross-app-components/Portal';
import { RootState } from '~/store/store';

import styles from './Notifications.module.scss';

export default function Notifications() {
    const { notifications } = useSelector((s: RootState) => s.notification);

    return (
        <Portal className={styles.root}>
            {notifications.map((n, i) => (
                // eslint-disable-next-line react/no-array-index-key
                <div key={i}>{n.level}</div>
            ))}
        </Portal>
    );
}
