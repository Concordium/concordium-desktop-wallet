import React from 'react';
import CloseButton from '~/cross-app-components/CloseButton';
import Button from '~/cross-app-components/Button';
import styles from './Transfers.module.scss';

interface Props {
    showBack: boolean;
    backOnClick?: () => void;
    exitOnClick: () => void;
    CurrentView: () => JSX.Element;
}

/**
 * Controls the flow of creating a transfer to encrypted.
 */
export default function TransferView({
    showBack,
    exitOnClick,
    backOnClick,
    CurrentView,
}: Props) {
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
            <CurrentView />
            <CloseButton className={styles.closeButton} onClick={exitOnClick} />
        </div>
    );
}
