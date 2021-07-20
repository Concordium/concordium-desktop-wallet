import React, { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import clsx from 'clsx';
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

export default function NodeStatus(): JSX.Element {
    const connectionSettings = useSelector(
        specificSettingSelector(settingKeys.nodeLocation)
    );
    const [statusText, setStatusText] = useState('');

    const setStatus = useCallback(async (controller: AbortController) => {
        if (controller.isAborted) {
            return;
        }
        setStatusText(Status.Testing);
        let status = Status.Unavailable;
        try {
            const upToDate = await isNodeUpToDate();
            status = upToDate ? Status.Ready : Status.CatchingUp;
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

    return <div className={clsx(styles.body)}>Node: {statusText}</div>;
}
