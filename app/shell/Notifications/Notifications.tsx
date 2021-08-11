import { AnimatePresence, motion, Transition, Variants } from 'framer-motion';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Notification from '~/components/Notification';
import Portal from '~/cross-app-components/Portal';
import {
    NotificationLevel,
    removeNotification,
} from '~/features/NotificationSlice';
import { RootState } from '~/store/store';

import styles from './Notifications.module.scss';

const transition: Transition = {
    ease: 'easeIn',
    duration: 0.2,
};

const transitionVariants: Variants = {
    initial: { opacity: 0, transform: 'translate(100%, 0)' },
    enter: { opacity: 1, transform: 'translate(0, 0)' },
    exit: {
        opacity: 0,
        transform: 'translate(0, -100%)',
        transition: { ease: 'easeOut' },
    },
};

export default function Notifications() {
    const { notifications } = useSelector((s: RootState) => s.notification);
    const dispatch = useDispatch();

    function handleClose(id: number) {
        dispatch(removeNotification(id));
    }

    return (
        <Portal className={styles.root}>
            <AnimatePresence>
                {notifications.map((n) => (
                    <motion.div
                        key={n.id}
                        transition={transition}
                        variants={transitionVariants}
                        initial="initial"
                        animate="enter"
                        exit="exit"
                    >
                        {n.level === NotificationLevel.Update ? (
                            // TODO: Replace with update notification
                            <Notification
                                level={n.level}
                                onCloseClick={() => handleClose(n.id)}
                            />
                        ) : (
                            <Notification
                                level={n.level}
                                onCloseClick={() => handleClose(n.id)}
                            >
                                {n.message}
                            </Notification>
                        )}
                    </motion.div>
                ))}
            </AnimatePresence>
        </Portal>
    );
}
