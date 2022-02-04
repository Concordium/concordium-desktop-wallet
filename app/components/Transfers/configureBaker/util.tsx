/* eslint-disable react/display-name */
import React, { ComponentType } from 'react';
import { useSelector } from 'react-redux';
import BakerPendingChange from '~/components/BakerPendingChange';
import { accountsInfoSelector } from '~/features/AccountSlice';
import { AccountInfo, Account } from '~/utils/types';

interface AccountOrInfo {
    account?: Account;
    accountInfo?: AccountInfo;
}

// eslint-disable-next-line import/prefer-default-export
export const withPendingChangeGuard = <P extends AccountOrInfo>(
    Component: ComponentType<P>
): ComponentType<P> => (p) => {
    const accountsInfo = useSelector(accountsInfoSelector);
    const info =
        p.accountInfo ?? p.account !== undefined
            ? // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              accountsInfo[p.account!.address]
            : undefined;

    const pendingChange = info?.accountBaker?.pendingChange;

    if (pendingChange) {
        return (
            <p className="mT30 mB0">
                Cannot update baker stake at this time:
                <div className="bodyEmphasized textError mV10">
                    <BakerPendingChange pending={pendingChange} />
                </div>
                It will be possible to proceed after this time has passed.
            </p>
        );
    }

    return <Component {...(p as P)} />;
};
