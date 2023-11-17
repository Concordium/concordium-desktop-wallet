/* eslint-disable react/display-name */
import { isBakerAccount } from '@concordium/web-sdk';
import React, { ComponentType } from 'react';
import { useSelector } from 'react-redux';
import StakePendingChange from '~/components/StakePendingChange';
import { accountsInfoSelector } from '~/features/AccountSlice';
import { AccountInfo, Account } from '~/utils/types';

interface AccountOrInfo {
    account?: Account;
    accountInfo?: AccountInfo;
}

// eslint-disable-next-line import/prefer-default-export
export const withPendingBakerChangeGuard = <P extends AccountOrInfo>(
    Component: ComponentType<P>
): ComponentType<P> => (p) => {
    const accountsInfo: Record<string, AccountInfo> = useSelector(
        accountsInfoSelector
    );
    const info =
        p.accountInfo ??
        (p.account !== undefined ? accountsInfo[p.account.address] : undefined);

    const pendingChange =
        info !== undefined && isBakerAccount(info)
            ? info.accountBaker.pendingChange
            : undefined;

    if (pendingChange) {
        return (
            <div className="mT30 mB0 body2">
                Cannot update validator stake at this time:
                <div className="bodyEmphasized textError mV10">
                    <StakePendingChange pending={pendingChange} />
                </div>
                It will be possible to proceed after this time has passed.
            </div>
        );
    }

    return <Component {...(p as P)} />;
};
