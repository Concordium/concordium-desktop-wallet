import React, { PropsWithChildren } from 'react';
import clsx from 'clsx';
import BackIcon from '@resources/svg/back-arrow.svg';
import CloseButton from '~/cross-app-components/CloseButton';
import Button from '~/cross-app-components/Button';
import styles from './Transfers.module.scss';

interface Props {
    showBack: boolean;
    backOnClick?: () => void;
    exitOnClick: () => void;
    className?: string;
}

/**
 * Container for the components when creating a transfer.
 * Contains the CurrentView
 */
export default function TransferView({
    showBack,
    exitOnClick,
    backOnClick,
    className,
    children,
}: PropsWithChildren<Props>) {
    return (
        <div className={clsx(styles.transferView, className)}>
            {showBack ? (
                <Button
                    clear
                    className={styles.backButton}
                    onClick={backOnClick}
                >
                    <BackIcon />
                </Button>
            ) : null}
            {children}
            <CloseButton className={styles.closeButton} onClick={exitOnClick} />
        </div>
    );
}
