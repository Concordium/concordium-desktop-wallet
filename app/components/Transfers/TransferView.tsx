import React from 'react';
import clsx from 'clsx';
import CloseButton from '~/cross-app-components/CloseButton';
import Button from '~/cross-app-components/Button';
import styles from './Transfers.module.scss';

interface Props {
    showBack: boolean;
    backOnClick?: () => void;
    exitOnClick: () => void;
    CurrentView: () => JSX.Element;
    className?: string;
}

/**
 * Container for the components when creating a transfer.
 */
export default function TransferView({
    showBack,
    exitOnClick,
    backOnClick,
    className,
    CurrentView,
}: Props) {
    return (
        <div className={clsx(styles.transferView, className)}>
            {showBack ? (
                <Button
                    clear
                    className={styles.backButton}
                    onClick={backOnClick}
                >
                    <h1>{'<'}</h1>
                </Button>
            ) : null}
            <CurrentView />
            <CloseButton className={styles.closeButton} onClick={exitOnClick} />
        </div>
    );
}
