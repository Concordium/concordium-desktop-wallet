import React, { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import clsx from 'clsx';
import PendingImage from '@resources/svg/pending-small.svg';
import SuccessImage from '@resources/svg/success.svg';
import RejectedImage from '@resources/svg/warning.svg';
import { isNodeUpToDate } from '~/node/nodeHelpers';
import AbortController from '~/utils/AbortController';
import { noOp } from '~/utils/basicHelpers';
import { specificSettingSelector } from '~/features/SettingsSlice';
import settingKeys from '~/constants/settingKeys.json';

import styles from './Status.module.scss';

const checkInterval = 15000;

enum Status {
    Testing = 'Pinging',
    CatchingUp = 'Catching up',
    Ready = 'Ready',
    Unavailable = 'Unavailable',
}

function getStatusImage(status: Status) {
    switch (status) {
        case Status.CatchingUp:
            return PendingImage;
        case Status.Unavailable:
            return RejectedImage;
        case Status.Ready:
            return SuccessImage;
        default:
            return undefined;
    }
}

export default function NodeStatus(): JSX.Element {
    const connectionSettings = useSelector(
        specificSettingSelector(settingKeys.nodeLocation)
    );
    const [statusText, setStatusText] = useState<Status>(Status.Testing);

    const setStatus = useCallback(async (controller: AbortController) => {
        if (controller.isAborted) {
            return;
        }
        setStatusText(Status.Testing);
        let status = Status.Unavailable;
        try {
            const upToDate = await isNodeUpToDate();
            status = upToDate ? Status.Ready : Status.Ready;
        } catch {
            // do nothing, status defaults to unavailable.
        } finally {
            if (!controller.isAborted) {
                setStatusText(status);
                setTimeout(setStatus, checkInterval, controller);
            }
        }
    }, []);

    useEffect(() => {
        if (setStatus) {
            const controller = new AbortController();
            setStatus(controller);
            return () => controller.abort();
        }
        return noOp;
    }, [connectionSettings?.value, setStatus]);

    const StatusImage = getStatusImage(statusText);
    const s = StatusImage && (
        <StatusImage height="15" className={styles.statusImage} />
    );
    return (
        <div className={clsx(styles.nodeStatus)}>
            <span>Node: {statusText}</span> {s}
        </div>
    );
}
