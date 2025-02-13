/* eslint-disable no-nested-ternary */
import { AccountInfoType } from '@concordium/web-sdk';
import React from 'react';
import { useSelector } from 'react-redux';
import { Redirect, Route } from 'react-router';
import MasterDetailPageLayout from '~/components/MasterDetailPageLayout';
import {
    chosenAccountSelector,
    chosenAccountInfoSelector,
    chosenAccountExtrasSelector,
} from '~/features/AccountSlice';
import routes from '~/constants/routes.json';
import { accountHasDeployedCredentialsSelector } from '~/features/CredentialSlice';
import { RootState } from '~/store/store';
import { useProtocolVersion } from '~/utils/dataHooks';
import { hasDelegationProtocol } from '~/utils/protocolVersion';
import AccountPageLayout from '../AccountPageLayout';
import AccountViewActions from '../AccountViewActions';
import BasicTransferRoutes from '../BasicTransferRoutes';
import ShowReleaseSchedule from './ShowReleaseSchedule';
import ScheduleTransfer from './ScheduleTransfer';
import CredentialInformation from './CredentialInformation';
import MoreActions from './MoreActions';
import BuildSchedule from './BuildSchedule';
import withAccountSync from '../withAccountSync';
import Delegation from './Delegation';
import Baking from './Baking/Baking';
import AccountCarousel from './AccountCarousel';

const { Master, Detail } = MasterDetailPageLayout;
const ToAccounts = () => <Redirect to={routes.ACCOUNTS} />;
const ToCreateScheduled = () => (
    <Redirect to={routes.ACCOUNTS_CREATESCHEDULEDTRANSFER} />
);

export default withAccountSync(function DetailsPage() {
    const account = useSelector(chosenAccountSelector);
    const accountInfo = useSelector(chosenAccountInfoSelector);
    const accountExtras = useSelector(chosenAccountExtrasSelector);
    const accountChanged = useSelector(
        (s: RootState) => s.accounts.accountChanged
    );
    const pv = useProtocolVersion(true);
    const hasCredentials = useSelector(
        account ? accountHasDeployedCredentialsSelector(account) : () => false
    );

    const isBaker =
        accountInfo !== undefined && accountInfo.type === AccountInfoType.Baker;
    const isDelegating =
        accountInfo !== undefined &&
        accountInfo.type === AccountInfoType.Delegator;
    const isDelegationPV = pv !== undefined && hasDelegationProtocol(pv);

    if (!account) {
        return null;
    }

    return (
        <AccountPageLayout>
            <Master>
                <AccountCarousel />
                <AccountViewActions
                    account={account}
                    accountInfo={accountInfo}
                />
                <MoreActions account={account} accountInfo={accountInfo} />
            </Master>
            <Detail>
                <BasicTransferRoutes account={account}>
                    <Route
                        path={routes.ACCOUNTS_SCHEDULED_TRANSFER}
                        component={
                            accountChanged ? ToCreateScheduled : BuildSchedule
                        }
                    />
                    <Route path={routes.ACCOUNTS_INSPECTRELEASESCHEDULE}>
                        <ShowReleaseSchedule accountInfo={accountInfo} />
                    </Route>
                    <Route path={routes.ACCOUNTS_CREATESCHEDULEDTRANSFER}>
                        {hasCredentials && accountInfo ? (
                            <ScheduleTransfer account={account} />
                        ) : (
                            <ToAccounts />
                        )}
                    </Route>
                    <Route path={routes.ACCOUNTS_CREDENTIAL_INFORMATION}>
                        <CredentialInformation
                            account={account}
                            accountInfo={accountInfo}
                        />
                    </Route>
                    <Route path={routes.ACCOUNTS_BAKING}>
                        {accountInfo !== undefined && !isDelegating ? (
                            <Baking
                                account={account}
                                accountInfo={accountInfo}
                                accountExtras={accountExtras}
                            />
                        ) : (
                            <ToAccounts />
                        )}
                    </Route>
                    <Route path={routes.ACCOUNTS_DELEGATION}>
                        {isDelegationPV &&
                        !isBaker &&
                        accountInfo !== undefined ? (
                            <Delegation
                                account={account}
                                accountInfo={accountInfo}
                            />
                        ) : (
                            <ToAccounts />
                        )}
                    </Route>
                </BasicTransferRoutes>
            </Detail>
        </AccountPageLayout>
    );
});
