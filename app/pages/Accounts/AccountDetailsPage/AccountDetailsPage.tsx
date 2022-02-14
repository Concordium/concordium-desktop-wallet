/* eslint-disable no-nested-ternary */
import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Redirect, Route } from 'react-router';
// import { LocationDescriptorObject } from 'history';
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
import OldAddBaker from './OldBakerFlows/AddBaker';
import OldRemoveBaker from './OldBakerFlows/RemoveBaker';
import OldUpdateBakerKeys from './OldBakerFlows/UpdateBakerKeys';
import OldUpdateBakerStake from './OldBakerFlows/UpdateBakerStake';
import OldUpdateBakerRestake from './OldBakerFlows/UpdateBakerRestake';
import { accountHasDeployedCredentialsSelector } from '~/features/CredentialSlice';
import { RootState } from '~/store/store';
import AddBaker from './AddBaker';
import RemoveBaker from './RemoveBaker';
import UpdateBakerStake from './UpdateBakerStake';
import UpdateBakerPool from './UpdateBakerPool';
import UpdateBakerKeys from './UpdateBakerKeys';
import ConfigureDelegation from './ConfigureDelegation';
import RemoveDelegation from './RemoveDelegation';
import { useProtocolVersion } from '~/utils/dataHooks';
import { StakeSettings } from '~/utils/transactionFlows/configureBaker';

const { Master, Detail } = MasterDetailPageLayout;
const ToAccounts = () => <Redirect to={routes.ACCOUNTS} />;
const ToCreateScheduled = () => (
    <Redirect to={routes.ACCOUNTS_CREATESCHEDULEDTRANSFER} />
);

export default withAccountSync(function DetailsPage() {
    const account = useSelector(chosenAccountSelector);
    const accountInfo = useSelector(chosenAccountInfoSelector);
    const accountChanged = useSelector(
        (s: RootState) => s.accounts.accountChanged
    );
    const pv = useProtocolVersion();
    const viewingShielded = useSelector(viewingShieldedSelector);
    const hasCredentials = useSelector(
        account ? accountHasDeployedCredentialsSelector(account) : () => false
    );
    const abortRef = useRef<((reason?: string) => void) | undefined>(undefined);
    useEffect(() => {
        const { current } = abortRef;
        return () => {
            current?.();
        };
    }, [account?.address]);

    const isBaker = Boolean(accountInfo?.accountBaker);
    const isDelegating = false;
    const isDelegationPV = pv !== undefined && pv >= BigInt(4);
    const canTransfer = hasCredentials && accountInfo !== undefined;
    const canDelegate = isDelegationPV && !isBaker && canTransfer;

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
                            accountChanged ? ToCreateScheduled : BuildSchedule
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
                        render={({ location }) => {
                            if (
                                !canTransfer ||
                                isBaker ||
                                accountInfo === undefined
                            ) {
                                return <ToAccounts />;
                            }

                            if (isDelegationPV) {
                                return (
                                    <AddBaker
                                        account={account}
                                        accountInfo={accountInfo}
                                    />
                                );
                            }

                            return (
                                <OldAddBaker
                                    location={
                                        location as LocationDescriptorObject<StakeSettings>
                                    }
                                    account={account}
                                />
                            );
                        }}
                    />
                    <Route path={routes.ACCOUNTS_REMOVE_BAKER}>
                        {canTransfer && isBaker && accountInfo !== undefined ? (
                            isDelegationPV ? (
                                <RemoveBaker
                                    account={account}
                                    accountInfo={accountInfo}
                                />
                            ) : (
                                <OldRemoveBaker
                                    account={account}
                                    accountInfo={accountInfo}
                                />
                            )
                        ) : (
                            <ToAccounts />
                        )}
                    </Route>
                    <Route path={routes.ACCOUNTS_UPDATE_BAKER_KEYS}>
                        {canTransfer && isBaker ? (
                            isDelegationPV ? (
                                <UpdateBakerKeys account={account} />
                            ) : (
                                <OldUpdateBakerKeys account={account} />
                            )
                        ) : (
                            <ToAccounts />
                        )}
                    </Route>
                    <Route path={routes.ACCOUNTS_UPDATE_BAKER_STAKE}>
                        {canTransfer && isBaker && accountInfo !== undefined ? (
                            isDelegationPV ? (
                                <UpdateBakerStake
                                    account={account}
                                    accountInfo={accountInfo}
                                />
                            ) : (
                                <OldUpdateBakerStake
                                    account={account}
                                    accountInfo={accountInfo}
                                />
                            )
                        ) : (
                            <ToAccounts />
                        )}
                    </Route>
                    <Route path={routes.ACCOUNTS_UPDATE_BAKER_RESTAKE_EARNINGS}>
                        {canTransfer && !isDelegationPV && isBaker ? (
                            <OldUpdateBakerRestake
                                account={account}
                                accountInfo={accountInfo}
                            />
                        ) : (
                            <ToAccounts />
                        )}
                    </Route>
                    <Route path={routes.ACCOUNTS_UPDATE_BAKER_POOL}>
                        {canDelegate && isBaker && accountInfo !== undefined ? (
                            <UpdateBakerPool
                                account={account}
                                accountInfo={accountInfo}
                            />
                        ) : (
                            <ToAccounts />
                        )}
                    </Route>
                    <Route path={routes.ACCOUNTS_CONFIGURE_DELEGATION}>
                        {canDelegate && accountInfo !== undefined ? (
                            <ConfigureDelegation
                                account={account}
                                accountInfo={accountInfo}
                            />
                        ) : (
                            <ToAccounts />
                        )}
                    </Route>
                    <Route path={routes.ACCOUNTS_REMOVE_DELEGATION}>
                        {canDelegate &&
                        isDelegating &&
                        accountInfo !== undefined ? (
                            <RemoveDelegation
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
