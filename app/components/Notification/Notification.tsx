import clsx from 'clsx';
import React, { PropsWithChildren } from 'react';
import { motion, Transition, Variants } from 'framer-motion';

import CloseIcon from '@resources/svg/cross.svg';
import { ClassName } from '~/utils/types';
import Button from '~/cross-app-components/Button';
import { NotificationLevel } from '~/features/NotificationSlice';

import styles from './Notification.module.scss';

const transition: Transition = {
    ease: 'backIn',
    duration: 0.2,
};

const transitionVariants: Variants = {
    initial: { opacity: 0, transform: 'translateX(100%)' },
    enter: { opacity: 1, transform: 'translateX(0%)' },
    exit: {
        opacity: 0,
        transform: 'translateX(100%)',
        transition: { ease: [0.36, 0, 0.66, -0.56] },
    },
};

type NotificationProps = ClassName &
    PropsWithChildren<{
        level: NotificationLevel;
        disableClose?: boolean;
        onCloseClick(): void;
    }>;

const modifier: Partial<Record<NotificationLevel, string>> = {
    [NotificationLevel.Error]: styles.error,
};

export default function Notification({
    children,
    level,
    disableClose = false,
    onCloseClick,
    className,
}: NotificationProps) {
    return (
        <motion.div
            className={clsx(styles.root, modifier[level], className)}
            transition={transition}
            variants={transitionVariants}
            initial="initial"
            animate="enter"
            exit="exit"
        >
            {disableClose || (
                <Button clear className={styles.close} onClick={onCloseClick}>
                    <CloseIcon width="11" />
                </Button>
            )}
            {children}
        </motion.div>
    );
}
