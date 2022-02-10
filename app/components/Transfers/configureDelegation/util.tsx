/* eslint-disable react/display-name */
import React, { ComponentType } from 'react';
import { useSelector } from 'react-redux';
import DelegationPendingChange from '~/components/DelegationPendingChange';
import { accountsInfoSelector } from '~/features/AccountSlice';
import { AccountInfo, Account } from '~/utils/types';

interface AccountOrInfo {
    account?: Account;
    accountInfo?: AccountInfo;
}

// eslint-disable-next-line import/prefer-default-export
export const withPendingDelegationChangeGuard = <P extends AccountOrInfo>(
    Component: ComponentType<P>
): ComponentType<P> => (p) => {
    const accountsInfo = useSelector(accountsInfoSelector);
    const info =
        p.accountInfo ??
        (p.account !== undefined ? accountsInfo[p.account.address] : undefined);

    // TODO #delegation not actual prop...
    const pendingChange = info?.accountDelegation?.pendingChange;

    if (pendingChange) {
        return (
            <p className="mT30 mB0">
                Cannot update delegation at this time:
                <div className="bodyEmphasized textError mV10">
                    <DelegationPendingChange pending={pendingChange} />
                </div>
                It will be possible to proceed after this time has passed.
            </p>
        );
    }

    return <Component {...(p as P)} />;
};
