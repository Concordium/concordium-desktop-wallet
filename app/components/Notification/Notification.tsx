import clsx from 'clsx';
import React, { PropsWithChildren } from 'react';
import CloseIcon from '@resources/svg/cross.svg';
import { motion, Transition, Variants } from 'framer-motion';
import Button from '~/cross-app-components/Button';
import { NotificationLevel } from '~/features/NotificationSlice';

import styles from './Notification.module.scss';

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
        <motion.div
            className={clsx(styles.root, modifier[level])}
            transition={transition}
            variants={transitionVariants}
            initial="initial"
            animate="enter"
            exit="exit"
        >
            <Button clear className={styles.close} onClick={onCloseClick}>
                <CloseIcon width="11" />
            </Button>
            {children}
        </motion.div>
    );
}
