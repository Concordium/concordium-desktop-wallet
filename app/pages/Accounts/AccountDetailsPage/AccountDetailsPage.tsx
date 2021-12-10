import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Redirect, Route } from 'react-router';

import { LocationDescriptorObject } from 'history';
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
import { AddBakerForm } from '~/components/AddBakerDetailsForm';
import { useIsSubsequentRender } from '~/utils/hooks';
import { RootState } from '~/store/store';

const { Master, Detail } = MasterDetailPageLayout;
const ToAccounts = () => <Redirect to={routes.ACCOUNTS} />;

export default withAccountSync(function DetailsPage() {
    const account = useSelector(chosenAccountSelector);
    const accountInfo = useSelector(chosenAccountInfoSelector);
    const viewingShielded = useSelector(viewingShieldedSelector);
    const hasCredentials = useSelector(
        account ? accountHasDeployedCredentialsSelector(account) : () => false
    );
    const hasLocationState = useSelector((s: RootState) =>
        Boolean(s.router.location.state)
    );
    const abortRef = useRef<((reason?: string) => void) | undefined>(undefined);
    useEffect(() => {
        const { current } = abortRef;
        return () => {
            current?.();
        };
    }, [account?.address]);

    const isBaker = Boolean(accountInfo?.accountBaker);
    const canTransfer = hasCredentials && Boolean(accountInfo);
    const isFirstRender = !useIsSubsequentRender();
    const accountHasChanged = isFirstRender && !hasLocationState;

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
                            accountHasChanged ? ToAccounts : BuildSchedule
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
                        render={({ location }) =>
                            canTransfer && !isBaker ? (
                                <AddBaker
                                    location={
                                        location as LocationDescriptorObject<AddBakerForm>
                                    }
                                    account={account}
                                />
                            ) : (
                                <ToAccounts />
                            )
                        }
                    />
                    <Route path={routes.ACCOUNTS_REMOVE_BAKER}>
                        {canTransfer && isBaker ? (
                            <RemoveBaker
                                account={account}
                                accountInfo={accountInfo}
                            />
                        ) : (
                            <ToAccounts />
                        )}
                    </Route>
                    <Route path={routes.ACCOUNTS_UPDATE_BAKER_KEYS}>
                        {canTransfer && isBaker ? (
                            <UpdateBakerKeys account={account} />
                        ) : (
                            <ToAccounts />
                        )}
                    </Route>
                    <Route path={routes.ACCOUNTS_UPDATE_BAKER_STAKE}>
                        {canTransfer && isBaker ? (
                            <UpdateBakerStake
                                account={account}
                                accountInfo={accountInfo}
                            />
                        ) : (
                            <ToAccounts />
                        )}
                    </Route>
                    <Route path={routes.ACCOUNTS_UPDATE_BAKER_RESTAKE_EARNINGS}>
                        {canTransfer && isBaker ? (
                            <UpdateBakerRestake
                                account={account}
                                accountInfo={accountInfo}
                            />
                        ) : (
                            <ToAccounts />
                        )}
                    </Route>

                    <Route path={routes.ACCOUNTS}>
                        {viewingShielded && !account.allDecrypted ? (
                            <DecryptComponent account={account} />
                        ) : (
                            <TransactionLog abortRef={abortRef} />
                        )}
                    </Route>
                </BasicTransferRoutes>
            </Detail>
        </AccountPageLayout>
    );
});
