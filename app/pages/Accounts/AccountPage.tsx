import React from 'react';
import { Switch, Route } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import PlusIcon from '@resources/svg/plus.svg';
import ShieldImage from '@resources/svg/shield.svg';
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

function getUnshieldedAmount(accountsInfo: AccountInfo[]) {
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

function getShieldedAmount(accounts: Account[]) {
    return sumToBigInt(accounts, (account) =>
        account.totalDecrypted ? BigInt(account.totalDecrypted) : 0n
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

    const totalShielded = getShieldedAmount(accounts);
    const totalAmount = getUnshieldedAmount(accountsInfo) + totalShielded;
    const totalLocked = getTotalLocked(accountsInfo);
    const totalStaked = getTotalStaked(accountsInfo);
    const atDisposal = totalAmount - totalLocked - totalStaked;
    const allDecrypted = isAllDecrypted(accounts);

    const hidden = allDecrypted ? null : (
        <>
            {' '}
            + <ShieldImage height="15" />
        </>
    );

    return (
        <MasterDetailPageLayout>
            <Header>
                <h1>Accounts</h1>
                <h1 className="mH40">|</h1>
                <h3 className="mR20">
                    Wallet Total:{' '}
                    <b>
                        {displayAsGTU(totalAmount)}
                        {hidden}{' '}
                    </b>
                    |
                </h3>
                <h3 className="mR20">
                    At disposal:{' '}
                    <b>
                        {displayAsGTU(atDisposal)}
                        {hidden}{' '}
                    </b>
                    |
                </h3>
                <h3 className="mR20">
                    Stake: <b>{displayAsGTU(totalStaked)}</b>
                </h3>
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
