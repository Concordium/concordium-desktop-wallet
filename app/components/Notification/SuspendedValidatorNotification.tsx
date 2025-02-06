import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AccountInfoType } from '@concordium/web-sdk';
import { push } from 'connected-react-router';

import { NotificationLevel } from '~/features/NotificationSlice';
import Button from '~/cross-app-components/Button';
import { accountsInfoSelector, chooseAccount } from '~/features/AccountSlice';
import routes from '~/constants/routes.json';
import Notification from './Notification';
import { displaySplitAddress } from '~/utils/accountHelpers';

interface Props {
    onClose(): void;
    accountAddress: string;
}

/**
 * A notification to be shown when an account is delegating to a staking pool
 * that is going to close in the near future.
 */
export default function SuspendedValidatorNotification({
    onClose,
    accountAddress,
}: Props) {
    const dispatch = useDispatch();
    const accountInfo = useSelector(accountsInfoSelector)[accountAddress];

    const toAccount = () => {
        let route: string;
        switch (accountInfo.type) {
            case AccountInfoType.Baker: {
                route = routes.ACCOUNTS_BAKING;
                break;
            }
            case AccountInfoType.Delegator: {
                route = routes.ACCOUNTS_DELEGATION;
                break;
            }
            default: {
                throw new Error('Expected account to be staking');
            }
        }

        dispatch(chooseAccount(accountAddress));
        dispatch(push(route));

        onClose();
    };

    return (
        <Notification
            className="flexColumn alignCenter"
            level={NotificationLevel.Error}
            onCloseClick={onClose}
        >
            <div className="flex alignCenter">
                The target pool of the following account is currently suspended.
            </div>
            <div className="flex alignCenter mT10 textBreakAll">
                <b>{displaySplitAddress(accountAddress)}</b>
            </div>
            <div className="inlineFlexColumn mT10">
                <Button className="mT10" size="tiny" onClick={toAccount}>
                    Go to account
                </Button>
            </div>
        </Notification>
    );
}
