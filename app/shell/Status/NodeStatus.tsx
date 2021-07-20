import React, { useEffect, useState, useCallback } from 'react';
import clsx from 'clsx';
import { isNodeUpToDate } from '~/node/nodeHelpers';
import AbortController from '~/utils/AbortController';
import { noOp } from '~/utils/basicHelpers';

import styles from './Status.module.scss';

const checkInterval = 15000;

enum Status {
    Testing = 'Pinging',
    CatchingUp = 'Catching up',
    Ready = 'Ready',
    Unavailable = 'Unavailable',
}

export default function LedgerStatus(): JSX.Element {
    const [statusText, setStatusText] = useState('');

    const setStatus = useCallback(async (controller: AbortController) => {
        if (controller.isAborted) {
            return;
        }
        setStatusText(Status.Testing);
        try {
            const upToDate = await isNodeUpToDate();
            setStatusText(upToDate ? Status.Ready : Status.CatchingUp);
        } catch (e) {
            setStatusText(Status.Unavailable);
        }
        setTimeout(setStatus, checkInterval, controller);
    }, []);

    useEffect(() => {
        if (setStatus) {
            const controller = new AbortController();
            setStatus(controller);
            return () => controller.abort();
        }
        return noOp;
    }, [setStatus]);

    return <div className={clsx(styles.body)}>Node: {statusText}</div>;
}
