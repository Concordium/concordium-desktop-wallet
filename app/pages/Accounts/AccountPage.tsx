import React from 'react';
import { Switch, Route } from 'react-router-dom';
import { Grid } from 'semantic-ui-react';
import { useSelector, useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import AccountList from './AccountList';
import AccountView from './AccountView';
import NoIdentities from '../../components/NoIdentities';
import {
    accountsSelector,
    accountsInfoSelector,
} from '../../features/AccountSlice';
import PageHeader from '../../components/PageHeader';
import BuildSchedule from './BuildSchedule';
import routes from '../../constants/routes.json';
import { Account, AccountInfo } from '../../utils/types';
import { displayAsGTU } from '../../utils/gtu';
import { sumToBigInt } from '../../utils/basicHelpers';

import PlusIcon from '../../../resources/svg/plus.svg';

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

export default function AccountsPage() {
    const dispatch = useDispatch();
    const accounts = useSelector(accountsSelector);
    const accountInfoMap = useSelector(accountsInfoSelector);
    const accountsInfo = Object.values(accountInfoMap);

    if (accounts.length === 0) {
        return (
            <>
                <PageHeader>
                    <h1>Accounts</h1>
                </PageHeader>
                <NoIdentities />;
            </>
        );
    }

    const totalAmount = getTotalAmount(accountsInfo);
    const totalLocked = getTotalLocked(accountsInfo);
    const totalStaked = getTotalStaked(accountsInfo);
    const atDisposal = totalAmount - totalLocked - totalStaked;
    const allDecrypted = isAllDecrypted(accounts);

    return (
        <>
            <PageHeader>
                <h1>Accounts | </h1>
                <h2>
                    Wallet Total: {displayAsGTU(totalAmount)}
                    {allDecrypted ? '' : ' + ?'} | At disposal:{' '}
                    {displayAsGTU(atDisposal)} {allDecrypted ? '' : ' + ?'} |
                    stake: {displayAsGTU(totalStaked)}
                </h2>
                <PageHeader.Button
                    align="right"
                    onClick={() => dispatch(push(routes.ACCOUNTCREATION))}
                >
                    <PlusIcon />
                </PageHeader.Button>
            </PageHeader>
            <Grid centered columns="equal" divided>
                <Grid.Row>
                    <Grid.Column>
                        <AccountList />
                    </Grid.Column>
                    <Grid.Column>
                        <Switch>
                            <Route
                                path={routes.ACCOUNTS_SCHEDULED_TRANSFER}
                                component={BuildSchedule}
                            />
                            <Route component={AccountView} />
                        </Switch>
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        </>
    );
}
