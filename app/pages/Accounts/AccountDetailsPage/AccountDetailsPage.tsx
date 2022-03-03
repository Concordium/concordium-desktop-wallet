/* eslint-disable no-nested-ternary */
import { isBakerAccount } from '@concordium/node-sdk/lib/src/accountHelpers';
import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Redirect, Route } from 'react-router';
import MasterDetailPageLayout from '~/components/MasterDetailPageLayout';
import {
    chosenAccountSelector,
    chosenAccountInfoSelector,
} from '~/features/AccountSlice';
import routes from '~/constants/routes.json';
import { viewingShieldedSelector } from '~/features/TransactionSlice';
import { accountHasDeployedCredentialsSelector } from '~/features/CredentialSlice';
import { RootState } from '~/store/store';
import { useProtocolVersion } from '~/utils/dataHooks';
import { hasDelegationProtocol } from '~/utils/protocolVersion';
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
import Delegating from './Delegating';
import Baking from './Baking/Baking';

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
    const viewingShielded = useSelector(viewingShieldedSelector);
    const pv = useProtocolVersion();
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

    const isBaker = accountInfo !== undefined && isBakerAccount(accountInfo);
    const isDelegationPV = pv !== undefined && hasDelegationProtocol(pv);

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
                    <Route path={routes.ACCOUNTS_BAKING}>
                        {accountInfo !== undefined ? (
                            <Baking
                                account={account}
                                accountInfo={accountInfo}
                            />
                        ) : (
                            <ToAccounts />
                        )}
                    </Route>
                    <Route path={routes.ACCOUNTS_DELEGATING}>
                        {isDelegationPV &&
                        !isBaker &&
                        accountInfo !== undefined ? (
                            <Delegating
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
