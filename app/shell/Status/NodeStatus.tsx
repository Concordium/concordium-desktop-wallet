import React, { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import PendingImage from '@resources/svg/pending-arrows.svg';
import SuccessImage from '@resources/svg/success.svg';
import RejectedImage from '@resources/svg/warning.svg';
import ScanningImage from '@resources/svg/scan.svg';
import { isNodeUpToDate } from '~/node/nodeHelpers';
import AbortController from '~/utils/AbortController';
import { specificSettingSelector } from '~/features/SettingsSlice';
import settingKeys from '~/constants/settingKeys.json';
import StatusPart from './StatusPart';

const checkInterval = 15000;
const showPingTimeout = 1000;

enum Status {
    Pinging = 'Pinging',
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
        case Status.Pinging:
            return ScanningImage;
        default:
            return undefined;
    }
}

export default function NodeStatus(): JSX.Element {
    const connectionSettings = useSelector(
        specificSettingSelector(settingKeys.nodeLocation)
    );
    const [statusText, setStatusText] = useState<Status>(Status.Pinging);

    const setStatus = useCallback(async (controller: AbortController) => {
        if (controller.isAborted) {
            return;
        }
        const setPingingTimeout = setTimeout(
            () => setStatusText(Status.Pinging),
            showPingTimeout
        );
        let status = Status.Unavailable;
        try {
            const upToDate = await isNodeUpToDate();
            status = upToDate ? Status.Ready : Status.CatchingUp;
        } catch {
            // do nothing, status defaults to unavailable.
        } finally {
            clearTimeout(setPingingTimeout);
            if (!controller.isAborted) {
                setStatusText(status);
                setTimeout(setStatus, checkInterval, controller);
            }
        }
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        setStatus(controller);
        return () => controller.abort();
    }, [connectionSettings?.value, setStatus]);

    const StatusImage = getStatusImage(statusText);

    return <StatusPart name="Node:" status={statusText} Icon={StatusImage} />;
}
