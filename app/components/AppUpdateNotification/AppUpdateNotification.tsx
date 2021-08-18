import React from 'react';

import CogIcon from '@resources/svg/settings.svg';
import Button from '~/cross-app-components/Button';
import { NotificationLevel } from '~/features/NotificationSlice';
import Notification from '../Notification';

interface Props {
    onUpdate(): void;
    onPostpone(): void;
}

export default function AppUpdateNotification({ onUpdate, onPostpone }: Props) {
    return (
        <Notification
            className="flexColumn alignCenter"
            level={NotificationLevel.Update}
            onCloseClick={onPostpone}
        >
            <div className="flex alignCenter">
                <CogIcon width="21" height="22" />
                <span className="mL5">New updates are available</span>
            </div>
            <div className="inlineFlexColumn mT20">
                <Button size="tiny" onClick={onUpdate}>
                    Restart & install
                </Button>
                <Button className="mT10" size="tiny" onClick={onPostpone}>
                    Remind me
                </Button>
            </div>
        </Notification>
    );
}
