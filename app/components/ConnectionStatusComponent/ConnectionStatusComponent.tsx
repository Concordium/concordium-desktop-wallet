import React from 'react';
import ErrorIcon from '@resources/svg/logo-error.svg';
import SuccessIcon from '@resources/svg/logo-checkmark.svg';
import LoadingComponent from '~/cross-app-components/Loading';

import styles from './ConnectionStatusComponent.module.scss';

export enum Status {
    Pending,
    Loading,
    Failed,
    Successful,
}

interface Props {
    status: Status;
    failedMessage?: string;
}

/**
 * A component for displaying the status of the connection to the node.
 */
export default function ConnectionStatusComponent({
    status,
    failedMessage = 'Connection failed',
}: Props): JSX.Element | null {
    let statusComponent = null;
    if (status === Status.Failed) {
        statusComponent = (
            <div>
                <ErrorIcon className={styles.icon} />
                <div className={styles.error}>{failedMessage}</div>
            </div>
        );
    } else if (status === Status.Loading) {
        statusComponent = <LoadingComponent inline text="Connecting to node" />;
    } else if (status === Status.Successful) {
        statusComponent = (
            <div>
                <SuccessIcon className={styles.icon} />
                <div className={styles.success}>Successfully connected</div>
            </div>
        );
    }

    return statusComponent;
}
