import React from 'react';
import { Switch, Route } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import PlusIcon from '@resources/svg/plus.svg';
import AccountList from './AccountList';
import AccountView from './AccountView';
import NoIdentities from '~/components/NoIdentities';
import {
    accountsSelector,
    accountsInfoSelector,
} from '~/features/AccountSlice';
import routes from '~/constants/routes.json';
import { Account, AccountInfo } from '~/utils/types';
import { displayAsGTU } from '~/utils/gtu';
import { sumToBigInt } from '~/utils/basicHelpers';
import PageLayout from '~/components/PageLayout';
import MasterDetailPageLayout from '~/components/MasterDetailPageLayout/MasterDetailPageLayout';
import BuildSchedule from './BuildSchedule';

function getTotalAmount(accountsInfo: AccountInfo[]) {
    return sumToBigInt(accountsInfo, (accountInfo) =>
        BigInt(accountInfo.accountAmount)
    );
}

function getTotalLocked(accountsInfo: AccountInfo[]) {
    return sumToBigInt(accountsInfo, (accountInfo) =>
        BigInt(accountInfo.accountReleaseSchedule.total)
    );
}

function getTotalStaked(accountsInfo: AccountInfo[]) {
    return sumToBigInt(accountsInfo, (accountInfo) =>
        accountInfo.accountBaker
            ? BigInt(accountInfo.accountBaker.stakedAmount)
            : 0n
    );
}

function isAllDecrypted(accounts: Account[]) {
    return accounts.every((account) => account.allDecrypted);
}

const { Header, Master, Detail } = MasterDetailPageLayout;

export default function AccountsPage() {
    const dispatch = useDispatch();
    const accounts = useSelector(accountsSelector);
    const accountInfoMap = useSelector(accountsInfoSelector);
    const accountsInfo = Object.values(accountInfoMap);

    if (accounts.length === 0) {
        return (
            <MasterDetailPageLayout>
                <Header>
                    <h1>Accounts</h1>
                </Header>
                <NoIdentities />
            </MasterDetailPageLayout>
        );
    }

    const totalAmount = getTotalAmount(accountsInfo);
    const totalLocked = getTotalLocked(accountsInfo);
    const totalStaked = getTotalStaked(accountsInfo);
    const atDisposal = totalAmount - totalLocked - totalStaked;
    const allDecrypted = isAllDecrypted(accounts);

    return (
        <MasterDetailPageLayout>
            <Header>
                <h1>Accounts | </h1>
                <h2>
                    Wallet Total: {displayAsGTU(totalAmount)}
                    {allDecrypted ? '' : ' + ?'} | At disposal:{' '}
                    {displayAsGTU(atDisposal)} {allDecrypted ? '' : ' + ?'} |
                    stake: {displayAsGTU(totalStaked)}
                </h2>
                <PageLayout.HeaderButton
                    align="right"
                    onClick={() => dispatch(push(routes.ACCOUNTCREATION))}
                >
                    <PlusIcon height="20" />
                </PageLayout.HeaderButton>
            </Header>
            <Master>
                <AccountList />
            </Master>
            <Detail>
                <Switch>
                    <Route
                        path={routes.ACCOUNTS_SCHEDULED_TRANSFER}
                        component={BuildSchedule}
                    />
                    <Route component={AccountView} />
                </Switch>
            </Detail>
        </MasterDetailPageLayout>
    );
}
