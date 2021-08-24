import React, { useState, useCallback, useEffect } from 'react';

import CogIcon from '@resources/svg/settings.svg';
import Button from '~/cross-app-components/Button';
import { NotificationLevel } from '~/features/NotificationSlice';
import Notification from '../Notification';

enum UpdateStatus {
    Available,
    Downloading,
    Verifying,
    Success,
    Error,
}

interface Props {
    onUpdate(): void;
    onPostpone(): void;
}

export default function AppUpdateNotification({ onUpdate, onPostpone }: Props) {
    const [state, setState] = useState<{
        status: UpdateStatus;
        message?: string;
    }>({ status: UpdateStatus.Available });

    useEffect(() => {
        const unsubs = [
            window.autoUpdate.onUpdateDownloaded(() =>
                setState({ status: UpdateStatus.Verifying })
            ),
            window.autoUpdate.onVerificationSuccess(() =>
                setState({ status: UpdateStatus.Success })
            ),
            window.autoUpdate.onError((e: string) =>
                setState({
                    status: UpdateStatus.Error,
                    message: JSON.parse(e).message,
                })
            ),
        ];

        return () => unsubs.forEach((f) => f());
    }, []);

    const update = useCallback(() => {
        onUpdate();
        setState({ status: UpdateStatus.Downloading });
    }, [onUpdate]);

    return (
        <Notification
            className="flexColumn alignCenter"
            level={NotificationLevel.Update}
            onCloseClick={onPostpone}
        >
            <div className="flex alignCenter">
                <CogIcon width="21" height="22" />
                <span className="mL5">
                    New updates are available {state.status}
                </span>
            </div>
            <div className="inlineFlexColumn mT20">
                <Button size="tiny" onClick={update}>
                    Restart & install
                </Button>
                <Button className="mT10" size="tiny" onClick={onPostpone}>
                    Remind me
                </Button>
            </div>
        </Notification>
    );
}
