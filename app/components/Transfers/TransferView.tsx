import React, { PropsWithChildren } from 'react';
import CloseButton from '~/cross-app-components/CloseButton';
import Button from '~/cross-app-components/Button';
import styles from './Transfers.module.scss';

interface Props {
    showBack: boolean;
    backOnClick?: () => void;
    exitOnClick: () => void;
}

/**
 * Container for the components when creating a transfer.
 * Contains the CurrentView
 */
export default function TransferView({
    showBack,
    exitOnClick,
    backOnClick,
    children,
}: PropsWithChildren<Props>) {
    return (
        <div className={styles.transferView}>
            {showBack ? (
                <Button
                    clear
                    className={styles.backButton}
                    onClick={backOnClick}
                >
                    <h1>{'<'}</h1>
                </Button>
            ) : null}
            {children}
            <CloseButton className={styles.closeButton} onClick={exitOnClick} />
        </div>
    );
}
