import { AnimatePresence } from 'framer-motion';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Notification from '~/components/Notification';
import AutoUpdateNotification from '~/components/Notification/AutoUpdateNotification';
import ManualUpdateNotification from '~/components/Notification/ManualUpdateNotification';
import ClosingBakerPoolNotification from '~/components/Notification/ClosingBakerPoolNotification';
import SuspendedValidatorNotification from '~/components/Notification/SuspendedValidatorNotification';
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
            <AnimatePresence>
                {notifications.map((n) => {
                    switch (n.level) {
                        case NotificationLevel.AutoUpdate:
                            return (
                                <AutoUpdateNotification
                                    key={n.id}
                                    onClose={() => handleClose(n.id)}
                                    onUpdate={() =>
                                        window.autoUpdate.triggerUpdate()
                                    }
                                    version={n.version}
                                />
                            );
                        case NotificationLevel.ManualUpdate:
                            return (
                                <ManualUpdateNotification
                                    key={n.id}
                                    onClose={() => handleClose(n.id)}
                                    version={n.version}
                                />
                            );
                        case NotificationLevel.ClosingBakerPool:
                            return (
                                <ClosingBakerPoolNotification
                                    key={n.id}
                                    onClose={() => handleClose(n.id)}
                                    accountName={n.accountName}
                                />
                            );
                        case NotificationLevel.SuspendedValidatorPool:
                            return (
                                <SuspendedValidatorNotification
                                    key={n.id}
                                    onClose={() => handleClose(n.id)}
                                    accountAddress={n.accountAddress}
                                />
                            );
                        default:
                            return (
                                <Notification
                                    key={n.id}
                                    level={n.level}
                                    onCloseClick={() => handleClose(n.id)}
                                >
                                    {n.message}
                                </Notification>
                            );
                    }
                })}
            </AnimatePresence>
        </Portal>
    );
}
