import React, { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PendingImage from '@resources/svg/pending-arrows.svg';
import SuccessImage from '@resources/svg/success.svg';
import RejectedImage from '@resources/svg/warning.svg';
import ScanningImage from '@resources/svg/scan.svg';
import { isNodeUpToDate } from '~/node/nodeHelpers';
import AbortController from '~/utils/AbortController';
import { specificSettingSelector } from '~/features/SettingsSlice';
import settingKeys from '~/constants/settingKeys.json';
import StatusPart from './StatusPart';
import { RootState } from '~/store/store';
import { NodeConnectionStatus } from '~/utils/types';
import { setNodeStatus } from '~/features/MiscSlice';

const checkInterval = 15000;
const showPingTimeout = 1000;

function getStatusImage(status: NodeConnectionStatus) {
    switch (status) {
        case NodeConnectionStatus.CatchingUp:
            return PendingImage;
        case NodeConnectionStatus.Unavailable:
            return RejectedImage;
        case NodeConnectionStatus.Ready:
            return SuccessImage;
        case NodeConnectionStatus.Pinging:
            return ScanningImage;
        default:
            return undefined;
    }
}

export default function NodeStatus(): JSX.Element {
    const dispatch = useDispatch();
    const connectionSettings = useSelector(
        specificSettingSelector(settingKeys.nodeLocation)
    );
    const statusText = useSelector((s: RootState) => s.misc.nodeStatus);
    const setStatusText = useCallback(
        (status: NodeConnectionStatus) => dispatch(setNodeStatus(status)),
        [dispatch]
    );

    const setStatus = useCallback(
        async (controller: AbortController) => {
            if (controller.isAborted) {
                return;
            }
            const setPingingTimeout = setTimeout(
                () => setStatusText(NodeConnectionStatus.Pinging),
                showPingTimeout
            );
            let status = NodeConnectionStatus.Unavailable;
            try {
                const upToDate = await isNodeUpToDate();
                status = upToDate
                    ? NodeConnectionStatus.Ready
                    : NodeConnectionStatus.CatchingUp;
            } catch {
                // do nothing, status defaults to unavailable.
            } finally {
                clearTimeout(setPingingTimeout);
                if (!controller.isAborted) {
                    setStatusText(status);
                    setTimeout(setStatus, checkInterval, controller);
                }
            }
        },
        [setStatusText]
    );

    useEffect(() => {
        const controller = new AbortController();
        setStatus(controller);
        return () => controller.abort();
    }, [connectionSettings?.value, setStatus]);

    const StatusImage = getStatusImage(statusText);

    return <StatusPart name="Node:" status={statusText} Icon={StatusImage} />;
}
