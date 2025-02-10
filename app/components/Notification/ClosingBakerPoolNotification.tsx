import React from 'react';
import Notification from './Notification';
import { NotificationLevel } from '~/features/NotificationSlice';
import Button from '~/cross-app-components/Button';

interface Props {
    onClose(): void;
    accountName: string;
}

/**
 * A notification to be shown when an account is delegating to a staking pool
 * that is going to close in the near future.
 */
export default function ClosingBakerPoolNotification({
    onClose,
    accountName,
}: Props) {
    return (
        <Notification
            className="flexColumn alignCenter"
            level={NotificationLevel.ClosingBakerPool}
            onCloseClick={onClose}
        >
            <div className="flex alignCenter">
                The target pool of the following account will close soon.
            </div>
            <div className="flex alignCenter mT10 textBreakAll">
                <b>{accountName}</b>
            </div>
            <div className="inlineFlexColumn mT10">
                <Button className="mT10" size="tiny" onClick={onClose}>
                    Remind me
                </Button>
            </div>
        </Notification>
    );
}
