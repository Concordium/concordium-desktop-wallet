import React from 'react';
import { useSelector } from 'react-redux';
import { Redirect, Route } from 'react-router';

import MasterDetailPageLayout from '~/components/MasterDetailPageLayout';
import {
    chosenAccountSelector,
    chosenAccountInfoSelector,
} from '~/features/AccountSlice';
import routes from '~/constants/routes.json';
import { viewingShieldedSelector } from '~/features/TransactionSlice';

import AccountBalanceView from '../AccountBalanceView';
import AccountPageLayout from '../AccountPageLayout';
import AccountViewActions from '../AccountViewActions';
import BasicTransferRoutes from '../BasicTransferRoutes';
import ShowAccountAddress from '../ShowAccountAddress';
import ShowReleaseSchedule from './ShowReleaseSchedule';
import ScheduleTransfer from './ScheduleTransfer';
import CredentialInformation from './CredentialInformation';
import MoreActions from './MoreActions';
import BuildSchedule from './BuildSchedule';
import TransactionLog from './TransactionLog';
import DecryptComponent from '../DecryptComponent';
import withAccountSync from '../withAccountSync';
import AddBaker from './AddBaker';
import RemoveBaker from './RemoveBaker';
import UpdateBakerKeys from './UpdateBakerKeys';
import UpdateBakerStake from './UpdateBakerStake';
import UpdateBakerRestake from './UpdateBakerRestake';
import { accountHasDeployedCredentialsSelector } from '~/features/CredentialSlice';

const { Master, Detail } = MasterDetailPageLayout;
const ToAccounts = () => <Redirect to={routes.ACCOUNTS} />;

export default withAccountSync(function DetailsPage() {
    const account = useSelector(chosenAccountSelector);
    const accountInfo = useSelector(chosenAccountInfoSelector);
    const viewingShielded = useSelector(viewingShieldedSelector);
    const hasCredentials = useSelector(
        account ? accountHasDeployedCredentialsSelector(account) : () => false
    );
    const isBaker = Boolean(accountInfo?.accountBaker);
    const hasBakerCooldown = Boolean(accountInfo?.accountBaker?.pendingChange);

    if (!account) {
        return null;
    }

    return (
        <AccountPageLayout>
            <Master>
                <AccountBalanceView />
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
                            hasCredentials && accountInfo
                                ? BuildSchedule
                                : ToAccounts
                        }
                    />
                    <Route path={routes.ACCOUNTS_ADDRESS}>
                        <ShowAccountAddress account={account} asCard />
                    </Route>
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
                    <Route
                        path={routes.ACCOUNTS_ADD_BAKER}
                        component={
                            hasCredentials && !isBaker && accountInfo
                                ? AddBaker
                                : ToAccounts
                        }
                    />
                    <Route path={routes.ACCOUNTS_REMOVE_BAKER}>
                        {hasCredentials &&
                        isBaker &&
                        accountInfo &&
                        !hasBakerCooldown ? (
                            <RemoveBaker />
                        ) : (
                            <ToAccounts />
                        )}
                    </Route>
                    <Route path={routes.ACCOUNTS_UPDATE_BAKER_KEYS}>
                        {hasCredentials && isBaker && accountInfo ? (
                            <UpdateBakerKeys />
                        ) : (
                            <ToAccounts />
                        )}
                    </Route>
                    <Route path={routes.ACCOUNTS_UPDATE_BAKER_STAKE}>
                        {hasCredentials &&
                        isBaker &&
                        accountInfo &&
                        !hasBakerCooldown ? (
                            <UpdateBakerStake />
                        ) : (
                            <ToAccounts />
                        )}
                    </Route>
                    <Route path={routes.ACCOUNTS_UPDATE_BAKER_RESTAKE_EARNINGS}>
                        {hasCredentials && isBaker && accountInfo ? (
                            <UpdateBakerRestake />
                        ) : (
                            <ToAccounts />
                        )}
                    </Route>

                    <Route path={routes.ACCOUNTS}>
                        {viewingShielded && !account.allDecrypted ? (
                            <DecryptComponent account={account} />
                        ) : (
                            <TransactionLog />
                        )}
                    </Route>
                </BasicTransferRoutes>
            </Detail>
        </AccountPageLayout>
    );
});
