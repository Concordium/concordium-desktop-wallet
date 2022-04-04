import React, { PropsWithChildren } from 'react';
import clsx from 'clsx';
import CloseButton from '~/cross-app-components/CloseButton';
import Card from '~/cross-app-components/Card';
import BackButton from '~/cross-app-components/BackButton';

import styles from './TransferView.module.scss';

interface Props {
    showBack: boolean;
    backOnClick?: () => void;
    exitOnClick?: () => void;
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
        <Card className={clsx(styles.transferView, className)}>
            {showBack ? (
                <BackButton
                    className={styles.backButton}
                    onClick={backOnClick}
                />
            ) : null}
            {children}
            {exitOnClick && (
                <CloseButton
                    className={styles.closeButton}
                    onClick={exitOnClick}
                />
            )}
        </Card>
    );
}
