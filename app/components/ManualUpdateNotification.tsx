import React from 'react';
import CogIcon from '@resources/svg/settings.svg';
import Notification from './Notification';
import { NotificationLevel } from '~/features/NotificationSlice';
import Button from '~/cross-app-components/Button';

interface Props {
    version: string;
    onClose(): void;
}

const downloadUrl =
    'https://developer.concordium.software/en/testnet/net/installation/downloads.html#concordium-desktop-wallet';

export default function ManualUpdateNotification({ version, onClose }: Props) {
    return (
        <Notification
            className="flexColumn alignCenter"
            level={NotificationLevel.ManualUpdate}
            onCloseClick={onClose}
        >
            <div className="flex alignCenter">
                <CogIcon width="21" height="22" />
                <span className="mL5">Version {version} is available.</span>
            </div>
            <div className="inlineFlexColumn mT20">
                <Button size="tiny" onClick={() => window.openUrl(downloadUrl)}>
                    Open website
                </Button>
                <Button className="mT10" size="tiny" onClick={onClose}>
                    Remind me
                </Button>
            </div>
        </Notification>
    );
}
