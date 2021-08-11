import React, { Fragment } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Notification from '~/components/Notification';
import Portal from '~/cross-app-components/Portal';
import {
    NotificationLevel,
    removeNotification,
} from '~/features/NotificationSlice';
import { RootState } from '~/store/store';

import styles from './Notifications.module.scss';

export default function Notifications() {
    const { notifications } = useSelector((s: RootState) => s.notification);
    const dispatch = useDispatch();

    function handleClose(id: number) {
        dispatch(removeNotification(id));
    }

    return (
        <Portal className={styles.root}>
            {notifications.map((n) => (
                <Fragment key={n.id}>
                    {n.level === NotificationLevel.Update ? (
                        <Notification
                            level={n.level}
                            onCloseClick={() => handleClose(n.id)}
                        /> // TODO: Replace with update notification
                    ) : (
                        <Notification
                            level={n.level}
                            onCloseClick={() => handleClose(n.id)}
                        >
                            {n.message}
                        </Notification>
                    )}
                </Fragment>
            ))}
        </Portal>
    );
}
